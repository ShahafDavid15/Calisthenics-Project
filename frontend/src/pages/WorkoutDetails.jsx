/**
 * WorkoutEntry.jsx.
 * Page for managing user workouts details:
 * Add a new exercise.
 * Display workout history in a table.
 * Search exercise.
 * Edit and delete exercise.
 * Show success/error messages in a modal.
 */

import React, { useState, useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import MessageModal from "../components/messagemodal/MessageModal";
import LoadingSpinner from "../components/loading/LoadingSpinner";
import classes from "./workoutDetails.module.css";
import { apiAxios } from "../utils/api";

export default function WorkoutEntry({ onLogout, currentUser }) {
  const userId = currentUser?.id;

  // Form state
  const [selectedExercise, setSelectedExercise] = useState("");
  const [repetitions, setRepetitions] = useState("");
  const [workoutDate, setWorkoutDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // Workouts list state
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [editWorkoutId, setEditWorkoutId] = useState(null);
  const [editedExercise, setEditedExercise] = useState("");
  const [editedReps, setEditedReps] = useState("");
  const [editedDate, setEditedDate] = useState("");

  // Modal state
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");
  const [showModal, setShowModal] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = "http://localhost:3002/api/workout_exercises";

  // Predefined exercises for dropdown
  const predefinedExercises = [
    "עליות כוח",
    "שכיבות שמיכה",
    "סקוואטים",
    "דיפס",
    "כפיפות בטן",
    "מתח",
    "לאנג' בולגרי",
    "ג'אמפ סקוואט",
  ];

  // Fetch user workouts from API
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await apiAxios.get(API_BASE);
        setWorkouts(response.data);
      } catch (error) {
        showError("שגיאה בטעינת נתוני האימונים");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Show error modal
  const showError = (msg) => {
    setModalType("error");
    setModalMessage(msg);
    setShowModal(true);
  };

  // Show success modal
  const showSuccess = (msg) => {
    setModalType("success");
    setModalMessage(msg);
    setShowModal(true);
  };

  // Extract error message from server response or fallback
  const extractError = (error, fallback) =>
    error?.response?.data?.error || fallback;

  // Add new workout
  const handleSubmitExercise = async () => {
    if (!selectedExercise || !repetitions || !workoutDate) {
      showError("יש למלא את כל השדות");
      return;
    }

    const repsValue = Number(repetitions);
    if (repsValue < 0) {
      showError("מספר חזרות חייב להיות חיובי");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    if (workoutDate > today) {
      showError("לא ניתן להזין תאריך עתידי");
      return;
    }

    if (!userId) {
      showError("משתמש לא מזוהה");
      return;
    }

    try {
      await apiAxios.post(API_BASE, {
        exercise: selectedExercise,
        repetitions: repsValue,
        workout_date: workoutDate,
      });

      const response = await apiAxios.get(API_BASE);
      setWorkouts(response.data);

      showSuccess("התרגיל נשלח ונשמר בהצלחה!");
      setSelectedExercise("");
      setRepetitions("");
      setWorkoutDate(new Date().toISOString().slice(0, 10));
      setSearchTerm("");
    } catch (error) {
      showError(extractError(error, "שגיאה בשליחה לשרת"));
    }
  };

  // Delete a workout
  const handleDelete = async (workoutId) => {
    try {
      await apiAxios.delete(`${API_BASE}/${workoutId}`);
      const response = await apiAxios.get(API_BASE);
      setWorkouts(response.data);
      showSuccess("האימון נמחק בהצלחה!");
    } catch (error) {
      showError(extractError(error, "שגיאה במחיקת האימון"));
    }
  };

  // Enter edit mode for a workout (use local date to avoid timezone shift)
  const handleEdit = (workout) => {
    setEditWorkoutId(workout.id);
    setEditedExercise(workout.exercise);
    setEditedReps(workout.repetitions);
    const d = workout.workout_date ? new Date(workout.workout_date) : null;
    const dateStr = d
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      : "";
    setEditedDate(dateStr);
  };

  // Cancel edit mode
  const handleCancel = () => {
    setEditWorkoutId(null);
    setEditedExercise("");
    setEditedReps("");
    setEditedDate("");
  };

  // Save edited workout
  const handleSave = async (id) => {
    const repsValue = Number(editedReps);
    if (repsValue < 0) {
      showError("מספר חזרות חייב להיות חיובי");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    if (editedDate > today) {
      showError("לא ניתן להזין תאריך עתידי");
      return;
    }

    try {
      await apiAxios.put(`${API_BASE}/${id}`, {
        exercise: editedExercise,
        repetitions: repsValue,
        workout_date: editedDate,
      });

      const response = await apiAxios.get(API_BASE);
      setWorkouts(response.data);
      setEditWorkoutId(null);
      showSuccess("העדכון נשמר בהצלחה!");
    } catch (error) {
      showError(extractError(error, "שגיאה בעדכון הנתונים"));
    }
  };

  // Clear search input
  const handleClear = () => {
    setSearchTerm("");
  };

  // Filter workouts live as user types – match from the start of the exercise name
  const displayedWorkouts = searchTerm.trim()
    ? workouts.filter((w) =>
        w.exercise.toLowerCase().startsWith(searchTerm.trim().toLowerCase())
      )
    : workouts;

  return (
    <div className={classes.container} dir="rtl">
      <Header />
      <NavBar />

      <main className={classes.main}>
        <button onClick={onLogout} className={classes.logoutButton}>
          התנתקות
        </button>

        <h2 className={classes.title}>הזנת נתוני אימון</h2>

        {loading && <LoadingSpinner text="טוען נתוני אימון..." />}

        {!loading && (
        <>
        <div className={classes.inputContainer}>
          <select
            className={classes.input}
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            <option value="">בחר תרגיל</option>
            {predefinedExercises.map((ex, i) => (
              <option key={i} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </div>

        <div className={classes.inputContainer}>
          <input
            type="number"
            min="0"
            placeholder="מספר חזרות"
            className={classes.input}
            value={repetitions}
            onChange={(e) => setRepetitions(e.target.value)}
          />
        </div>

        <div className={classes.inputContainer}>
          <input
            type="date"
            className={classes.input}
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>

        <button onClick={handleSubmitExercise} className={classes.button}>
          שלח
        </button>

        <div className={classes.tableContainer}>
          <h3>היסטוריית אימונים</h3>

          <div className={classes.searchBarRow}>
            <input
              type="text"
              className={classes.searchInput}
              placeholder="חפש תרגיל..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className={`${classes.actionButton} ${classes.deleteButton}`}
                onClick={handleClear}
              >
                נקה
              </button>
            )}
          </div>

          <div className={classes.tableScrollWrapper}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>תרגיל</th>
                <th>מספר חזרות</th>
                <th>תאריך האימון</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {displayedWorkouts.length === 0 && searchTerm.trim() && (
                <tr>
                  <td colSpan="4" className={classes.noResultsCell}>
                    לא נמצאו תוצאות לחיפוש &quot;{searchTerm}&quot;
                  </td>
                </tr>
              )}
              {displayedWorkouts.length === 0 && !searchTerm.trim() && (
                <tr>
                  <td colSpan="4" className={classes.noResultsCell}>
                    אין נתוני אימון עדיין
                  </td>
                </tr>
              )}

              {displayedWorkouts.map((w) => (
                <tr key={w.id}>
                  <td>
                    {editWorkoutId === w.id ? (
                      <select
                        value={editedExercise}
                        onChange={(e) => setEditedExercise(e.target.value)}
                        className={classes.inlineInput}
                      >
                        {predefinedExercises.map((ex, i) => (
                          <option key={i} value={ex}>
                            {ex}
                          </option>
                        ))}
                      </select>
                    ) : (
                      w.exercise
                    )}
                  </td>
                  <td>
                    {editWorkoutId === w.id ? (
                      <input
                        type="number"
                        min="0"
                        value={editedReps}
                        onChange={(e) => setEditedReps(e.target.value)}
                        className={classes.inlineInput}
                      />
                    ) : (
                      w.repetitions
                    )}
                  </td>
                  <td>
                    {editWorkoutId === w.id ? (
                      <input
                        type="date"
                        value={editedDate}
                        onChange={(e) => setEditedDate(e.target.value)}
                        max={new Date().toISOString().slice(0, 10)}
                        className={classes.inlineInput}
                      />
                    ) : (
                      new Date(w.workout_date).toLocaleDateString("he-IL")
                    )}
                  </td>
                  <td>
                    {editWorkoutId === w.id ? (
                      <>
                        <button
                          className={`${classes.actionButton} ${classes.saveButton}`}
                          onClick={() => handleSave(w.id)}
                        >
                          שמור
                        </button>
                        <button
                          className={`${classes.actionButton} ${classes.cancelActionButton}`}
                          onClick={handleCancel}
                        >
                          ביטול
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(w)}
                          className={`${classes.actionButton} ${classes.updateButton}`}
                        >
                          עדכן
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          className={`${classes.actionButton} ${classes.deleteButton}`}
                        >
                          מחק
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        </>
        )}
      </main>

      <Footer />

      {/* Modal for displaying messages */}
      {showModal && (
        <MessageModal
          type={modalType}
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
