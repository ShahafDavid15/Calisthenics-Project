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
import classes from "./workoutDetails.module.css";
import axios from "axios";

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
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);

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

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE}?user_id=${userId}`);
        setWorkouts(response.data);
      } catch (error) {
        console.error(error);
        showError("שגיאה בטעינת נתוני האימונים");
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
      await axios.post(API_BASE, {
        user_id: userId,
        exercise: selectedExercise,
        repetitions: repsValue,
        workout_date: workoutDate,
      });

      const response = await axios.get(`${API_BASE}?user_id=${userId}`);
      setWorkouts(response.data);

      showSuccess("התרגיל נשלח ונשמר בהצלחה!");
      setSelectedExercise("");
      setRepetitions("");
      setWorkoutDate(today);
      setSearchTerm("");
      setFilteredWorkouts([]);
    } catch (error) {
      console.error(error);
      showError("שגיאה בשליחה לשרת");
    }
  };

  // Delete a workout
  const handleDelete = async (workoutId) => {
    try {
      await axios.delete(`${API_BASE}/${workoutId}`);
      const response = await axios.get(`${API_BASE}?user_id=${userId}`);
      setWorkouts(response.data);
      showSuccess("האימון נמחק בהצלחה!");
      setFilteredWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    } catch (error) {
      console.error(error);
      showError("שגיאה במחיקת האימון");
    }
  };

  // Enter edit mode for a workout
  const handleEdit = (workout) => {
    setEditWorkoutId(workout.id);
    setEditedExercise(workout.exercise);
    setEditedReps(workout.repetitions);
    setEditedDate(workout.workout_date?.slice(0, 10) || "");
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
      await axios.put(`${API_BASE}/${id}`, {
        exercise: editedExercise,
        repetitions: repsValue,
        workout_date: editedDate,
      });

      const response = await axios.get(`${API_BASE}?user_id=${userId}`);
      setWorkouts(response.data);
      setEditWorkoutId(null);
      showSuccess("העדכון נשמר בהצלחה!");
    } catch (error) {
      console.error(error);
      showError("שגיאה בעדכון הנתונים");
    }
  };

  // Search workouts by exercise
  const handleSearch = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setFilteredWorkouts([]);
      return;
    }
    const results = workouts.filter((w) => w.exercise === trimmed);
    setFilteredWorkouts(results);
  };

  // Clear search input and results
  const handleClear = () => {
    setSearchTerm("");
    setFilteredWorkouts([]);
  };

  // Determine which workouts to display
  const displayedWorkouts =
    filteredWorkouts.length > 0 ? filteredWorkouts : workouts;

  return (
    <div className={classes.container} dir="rtl">
      <Header />
      <NavBar />

      <main className={classes.main}>
        <button onClick={onLogout} className={classes.logoutButton}>
          התנתקות
        </button>

        <h2 className={classes.title}>הזנת נתוני אימון</h2>

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
              placeholder="חפש תרגיל"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className={`${classes.actionButton} ${classes.updateButton}`}
              onClick={handleSearch}
            >
              חפש
            </button>
            <button
              className={`${classes.actionButton} ${classes.deleteButton}`}
              onClick={handleClear}
            >
              נקה
            </button>
          </div>

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
              {displayedWorkouts.length === 0 && (
                <tr>
                  <td colSpan="4" className={classes.noResultsCell}>
                    לא נמצאו תוצאות לתרגיל "{searchTerm}"
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
