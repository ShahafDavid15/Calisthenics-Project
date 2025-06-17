import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./membership.module.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import React from "react";

export default function Membership({ onLogout }) {
  const [memberships, setMemberships] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // State to track the currently editing membership's ID
  const [editingMembershipId, setEditingMembershipId] = useState(null);
  // State to hold the temporary data while editing
  const [currentEditData, setCurrentEditData] = useState({
    name: "",
    price: "",
    duration_days: "",
  });

  // NEW: State to control visibility of the "Add New Membership" row
  const [showAddForm, setShowAddForm] = useState(false);
  // NEW: State to hold data for the new membership being added
  const [newMembershipData, setNewMembershipData] = useState({
    name: "",
    price: "",
    duration_days: "",
  });

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await fetch("/api/memberships");
      if (!response.ok) {
        throw new Error("Failed to fetch memberships");
      }
      const data = await response.json();
      const sortedMemberships = data.sort((a, b) => a.price - b.price);
      setMemberships(sortedMemberships);
    } catch (error) {
      showErrorMessage("Failed to load memberships");
    }
  };

  // NEW: handleAddSubmit will now be called when "הוסף" button in the table is clicked
  const handleAddSubmit = async () => {
    if (
      !newMembershipData.name ||
      !newMembershipData.price ||
      !newMembershipData.duration_days
    ) {
      showErrorMessage("אנא מלא את כל השדות עבור המנוי החדש.");
      return;
    }
    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newMembershipData.name,
          price: parseFloat(newMembershipData.price),
          duration_days: parseInt(newMembershipData.duration_days),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add membership: ${errorText}`);
      }

      fetchMemberships(); // Re-fetch to update the table
      setNewMembershipData({ name: "", price: "", duration_days: "" }); // Reset new form data
      setShowAddForm(false); // Hide the add form row
    } catch (error) {
      showErrorMessage(error.message);
    }
  };

  // Function to start editing a membership
  const startEditing = (membership) => {
    // If we're adding a new membership, cancel that first
    if (showAddForm) {
      setShowAddForm(false);
      setNewMembershipData({ name: "", price: "", duration_days: "" });
    }
    setEditingMembershipId(membership.membership_id);
    setCurrentEditData({
      name: membership.name,
      price: membership.price,
      duration_days: membership.duration_days,
    });
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingMembershipId(null);
    setCurrentEditData({ name: "", price: "", duration_days: "" });
  };

  // Function to handle changes in the inline edit fields (for existing memberships)
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to handle changes in the new membership input fields
  const handleNewMembershipChange = (e) => {
    const { name, value } = e.target;
    setNewMembershipData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (id) => {
    try {
      const response = await fetch(`/api/memberships/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: currentEditData.name,
          price: parseFloat(currentEditData.price),
          duration_days: parseInt(currentEditData.duration_days),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update membership: ${errorText}`);
      }

      fetchMemberships(); // Re-fetch to update the table
      cancelEditing(); // Exit editing mode
    } catch (error) {
      showErrorMessage(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/memberships/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete membership: ${errorText}`);
      }

      fetchMemberships(); // Re-fetch to update the table
    } catch (error) {
      showErrorMessage(error.message);
    }
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  // NEW: Function to toggle the add form visibility
  const toggleAddForm = () => {
    // If we are currently editing an existing membership, cancel that first
    if (editingMembershipId) {
      cancelEditing();
    }
    setShowAddForm((prev) => !prev);
    // Reset new form data when showing the form
    if (!showAddForm) {
      setNewMembershipData({ name: "", price: "", duration_days: "" });
    }
  };

  return (
    <div className={classes.container}>
      <Header />
      <NavBar />

      <button onClick={onLogout} className={classes.logoutButton}>
        התנתקות
      </button>

      <Link to="/home" className={classes.topLink}>
        חזור לדף הבית
      </Link>

      <main className={classes.main}>
        <h2 className={classes.title}>ניהול מנויים</h2>

        <div className={classes.membershipsList}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>שם</th>
                <th>מחיר</th>
                <th>ימים</th>
                <th>
                  פעולות{" "}
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
              {memberships.map((membership) => (
                <tr key={membership.membership_id}>
                  {editingMembershipId === membership.membership_id ? (
                    // Render input fields when in editing mode
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
                    // Render static text when not in editing mode
                    <>
                      <td>{membership.name}</td>
                      <td>{membership.price} ₪</td>
                      <td>{membership.duration_days} ימים</td>
                      <td>
                        <button
                          onClick={() => startEditing(membership)}
                          className={classes.actionButton}
                        >
                          עדכן
                        </button>
                        <button
                          onClick={() => handleDelete(membership.membership_id)}
                          className={classes.actionButton}
                        >
                          מחק
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {/* NEW: Row for adding a new membership */}
              {showAddForm && (
                <tr>
                  <td>
                    <input
                      type="text"
                      name="name"
                      placeholder="שם המנוי"
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
                  </td>
                  <td>
                    <input
                      type="number"
                      name="duration_days"
                      placeholder="מספר ימים"
                      value={newMembershipData.duration_days}
                      onChange={handleNewMembershipChange}
                      className={classes.inlineInput}
                      required
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
            </tbody>
          </table>
        </div>

        {/* The Add New Membership Form section is now removed as it's replaced by the inline form */}
        {/* The Update Membership Form section was already commented out and can be removed */}

        {/* Error Modal */}
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
