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

  const [editingMembershipId, setEditingMembershipId] = useState(null);
  const [currentEditData, setCurrentEditData] = useState({
    name: "",
    price: "",
    duration_days: "",
  });

  const [showAddForm, setShowAddForm] = useState(false);
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

      fetchMemberships();
      setNewMembershipData({ name: "", price: "", duration_days: "" });
      setShowAddForm(false);
    } catch (error) {
      showErrorMessage(error.message);
    }
  };

  const startEditing = (membership) => {
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

  const cancelEditing = () => {
    setEditingMembershipId(null);
    setCurrentEditData({ name: "", price: "", duration_days: "" });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

      fetchMemberships();
      cancelEditing();
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

      fetchMemberships();
    } catch (error) {
      showErrorMessage(error.message);
    }
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const toggleAddForm = () => {
    if (editingMembershipId) {
      cancelEditing();
    }
    setShowAddForm((prev) => !prev);
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
                    <>
                      <td>{membership.name}</td>
                      <td>{membership.price} ₪</td>
                      <td>{membership.duration_days} ימים</td>
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
