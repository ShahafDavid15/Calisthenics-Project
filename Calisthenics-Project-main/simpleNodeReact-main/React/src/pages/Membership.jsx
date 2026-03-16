/**
 * Membership.jsx
 * Page for managing memberships in the system.
 * Provides full CRUD functionality for the admin:
 * View all memberships
 * Add a new membership
 * Update existing membership details
 * Delete memberships
 */

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./membership.module.css";
import { useState, useEffect } from "react";
import React from "react";
import { apiFetch, getErrorMessage } from "../utils/api";
import LoadingSpinner from "../components/loading/LoadingSpinner";

export default function Membership({ onLogout, currentUser }) {
  // State for all memberships
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Error handling state
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Editing state
  const [editingMembershipId, setEditingMembershipId] = useState(null);
  const [currentEditData, setCurrentEditData] = useState({
    name: "",
    price: "",
    duration_days: "",
    entry_count: 0,
    price_with_vat: 0,
  });

  // State for showing add-new-membership form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMembershipData, setNewMembershipData] = useState({
    name: "",
    price: "",
    duration_days: "",
    entry_count: 0,
    price_with_vat: 0,
  });

  const VAT_RATE = 0.18;

  // Fetch memberships from backend on component mount
  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await apiFetch("/api/memberships");
        if (!response.ok) {
          showErrorMessage(await getErrorMessage(response));
          return;
        }
        const data = await response.json();
        const sorted = data.sort((a, b) => a.price - b.price);
        setMemberships(sorted);
      } catch {
        showErrorMessage("שגיאה בטעינת המנויים. נסה לרענן את הדף.");
      } finally {
        setLoading(false);
      }
    };
    fetchMemberships();
  }, []);

  // Display an error modal with a given message
  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  // Handle submission of new membership
  const handleAddSubmit = async () => {
    // Validate required fields
    if (
      !newMembershipData.name ||
      !newMembershipData.price ||
      !newMembershipData.duration_days
    ) {
      showErrorMessage("אנא מלא את כל השדות.");
      return;
    }

    // Convert input strings to numbers
    const priceValue = parseFloat(newMembershipData.price);
    const durationValue = parseInt(newMembershipData.duration_days);

    // Validate positive numbers
    if (priceValue <= 0) {
      showErrorMessage("מחיר חייב להיות חיובי.");
      return;
    }
    if (durationValue <= 0) {
      showErrorMessage("מספר ימים חייב להיות חיובי.");
      return;
    }

    try {
      // Send POST request to backend to add membership
      const response = await apiFetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMembershipData.name,
          price: priceValue,
          duration_days: durationValue,
          entry_count: newMembershipData.entry_count,
        }),
      });

      if (!response.ok) throw new Error("Failed to add membership");

      // Refresh the memberships list
      const res = await apiFetch("/api/memberships");
      const data = await res.json();
      const sorted = data.sort((a, b) => a.price - b.price);
      setMemberships(sorted);

      // Reset form
      setNewMembershipData({
        name: "",
        price: "",
        duration_days: "",
        entry_count: 0,
      });
      setShowAddForm(false);
    } catch (error) {
      showErrorMessage(error.message);
    }
  };

  // Start editing a selected membership
  const startEditing = (membership) => {
    // Close add form if open
    if (showAddForm) {
      setShowAddForm(false);
      setNewMembershipData({
        name: "",
        price: "",
        duration_days: "",
        entry_count: 0,
      });
    }
    setEditingMembershipId(membership.membership_id);
    setCurrentEditData({
      name: membership.name,
      price: membership.price,
      duration_days: membership.duration_days,
      entry_count: membership.entry_count,
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMembershipId(null);
    setCurrentEditData({
      name: "",
      price: "",
      duration_days: "",
      entry_count: 0,
    });
  };

  // Update state when editing membership input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Update state when adding new membership input changes
  const handleNewMembershipChange = (e) => {
    const { name, value } = e.target;

    setNewMembershipData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "price") {
        const numericPrice = parseFloat(value) || 0;
        updated.price_with_vat = numericPrice * (1 + VAT_RATE);
      }

      return updated;
    });
  };

  // Submit updates to an existing membership
  const handleUpdate = async (id) => {
    if (
      !currentEditData.name ||
      currentEditData.price === "" ||
      currentEditData.duration_days === ""
    ) {
      showErrorMessage("אנא מלא את כל השדות.");
      return;
    }

    const priceValue = parseFloat(currentEditData.price);
    const durationValue = parseInt(currentEditData.duration_days);
    const entryValue = parseInt(currentEditData.entry_count);

    if (priceValue <= 0 || durationValue <= 0 || entryValue < 0) {
      showErrorMessage("לא ניתן להזין ערכים שליליים.");
      return;
    }

    try {
      const response = await apiFetch(`/api/memberships/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentEditData.name,
          price: priceValue,
          duration_days: durationValue,
          entry_count: entryValue,
        }),
      });

      if (!response.ok) throw new Error("Failed to update membership");

      // Refresh memberships list after update
      const res = await apiFetch("/api/memberships");
      const data = await res.json();
      const sorted = data.sort((a, b) => a.price - b.price);
      setMemberships(sorted);

      cancelEditing();
    } catch (error) {
      showErrorMessage(error.message);
    }
  };

  // Delete a membership
  const handleDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/memberships/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete membership");

      // Refresh memberships list
      const res = await apiFetch("/api/memberships");
      const data = await res.json();
      const sorted = data.sort((a, b) => a.price - b.price);
      setMemberships(sorted);
    } catch (error) {
      showErrorMessage(error.message);
    }
  };

  // Toggle display of the add-new-membership form
  const toggleAddForm = () => {
    if (editingMembershipId) cancelEditing();
    setShowAddForm((prev) => !prev);
    if (!showAddForm) {
      setNewMembershipData({
        name: "",
        price: "",
        duration_days: "",
        entry_count: 0,
      });
    }
  };

  return (
    <div className={classes.container}>
      <Header />
      <NavBar currentUser={currentUser} />
      {/* Logout button */}
      <button onClick={onLogout} className={classes.logoutButton}>
        התנתקות
      </button>

      <main className={classes.main}>
        <h2 className={classes.title}>ניהול מנויים</h2>

        {loading && <LoadingSpinner text="טוען מנויים..." />}

        {!loading && (
        <div className={classes.membershipsList}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>שם</th>
                <th>מחיר</th>
                <th>ימים </th>
                <th>מספר כניסות בשבוע</th>
                <th>
                  {/* Button to toggle add-new-membership form */}
                  <button
                    onClick={toggleAddForm}
                    className={classes.actionButtonAdd}
                  >
                    +
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Add membership form row */}
              {showAddForm && (
                <tr>
                  <td>
                    <input
                      type="text"
                      name="name"
                      placeholder="שם מנוי"
                      value={newMembershipData.name}
                      onChange={handleNewMembershipChange}
                      className={classes.inlineInput}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="price"
                      placeholder="מחיר"
                      value={newMembershipData.price}
                      onChange={handleNewMembershipChange}
                      className={classes.inlineInput}
                      required
                    />
                    {newMembershipData.price && (
                      <div className={classes.priceWithVat}>
                        מחיר כולל מע"מ: ₪
                        {Number(
                          newMembershipData.price_with_vat
                        ).toLocaleString("he-IL", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      name="duration_days"
                      placeholder="ימים"
                      value={newMembershipData.duration_days}
                      onChange={handleNewMembershipChange}
                      className={classes.inlineInput}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="entry_count"
                      placeholder="מספר כניסות"
                      value={newMembershipData.entry_count}
                      onChange={handleNewMembershipChange}
                      className={classes.inlineInput}
                    />
                  </td>
                  <td>
                    <button
                      onClick={handleAddSubmit}
                      className={`${classes.actionButton} ${classes.saveButton}`}
                    >
                      הוסף
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className={`${classes.actionButton} ${classes.cancelActionButton}`}
                    >
                      ביטול
                    </button>
                  </td>
                </tr>
              )}

              {/* List memberships */}
              {memberships.map((membership) => (
                <tr key={membership.membership_id}>
                  {editingMembershipId === membership.membership_id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          name="name"
                          value={currentEditData.name}
                          onChange={handleEditChange}
                          className={classes.inlineInput}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="price"
                          value={currentEditData.price}
                          onChange={handleEditChange}
                          className={classes.inlineInput}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="duration_days"
                          value={currentEditData.duration_days}
                          onChange={handleEditChange}
                          className={classes.inlineInput}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="entry_count"
                          value={currentEditData.entry_count}
                          onChange={handleEditChange}
                          className={classes.inlineInput}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => handleUpdate(membership.membership_id)}
                          className={`${classes.actionButton} ${classes.saveButton}`}
                        >
                          שמור
                        </button>
                        <button
                          onClick={cancelEditing}
                          className={`${classes.actionButton} ${classes.cancelActionButton}`}
                        >
                          ביטול
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{membership.name}</td>
                      <td>{membership.price} ₪</td>
                      <td>{membership.duration_days} ימים</td>
                      <td>{membership.entry_count}</td>
                      <td>
                        <button
                          onClick={() => startEditing(membership)}
                          className={classes.editButton}
                        >
                          עדכן
                        </button>
                        <button
                          onClick={() => handleDelete(membership.membership_id)}
                          className={classes.deleteButton}
                        >
                          מחק
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Error modal */}
        {showError && (
          <div className={classes.errorModal}>
            <div className={classes.errorContent}>
              <h3>שגיאה</h3>
              <p>{errorMessage}</p>
              <button onClick={() => setShowError(false)}>סגור</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
