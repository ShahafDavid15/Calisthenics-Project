// Import necessary components, styles, hooks, and libraries
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./workoutDetails.module.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import React from "react";
import MessageModal from "../components/messagemodal/MessageModal";

export default function WorkoutEntry({ onLogout }) {
  const [selectedExercise, setSelectedExercise] = useState("");
  const [repetitions, setRepetitions] = useState("");
  const [duration, setDuration] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const [editWorkoutId, setEditWorkoutId] = useState(null);
  const [editedExercise, setEditedExercise] = useState("");
  const [editedReps, setEditedReps] = useState("");
  const [editedDuration, setEditedDuration] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);

  const API_BASE = "http://localhost:3002/api/workout_exercises";

  const predefinedExercises = [
    "עליות כוח",
    "שכיבות שמיכה",
    "סקוואטים",
    "דיפס",
    "בטן",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_BASE);
        setWorkouts(response.data);
      } catch (error) {
        console.error(error);
        showError("שגיאה בטעינת נתוני האימונים");
      }
    };
    fetchData();
  }, []);

  const showError = (msg) => {
    setModalType("error");
    setModalMessage(msg);
    setShowModal(true);
  };

  const showSuccess = (msg) => {
    setModalType("success");
    setModalMessage(msg);
    setShowModal(true);
  };

  const handleSubmitExercise = async () => {
    if (!selectedExercise || !repetitions || !duration) {
      showError("יש למלא את כל השדות");
      return;
    }

    const repsValue = Number(repetitions);
    const durationValue = Number(duration);

    if (repsValue < 0 || durationValue < 0) {
      showError("מספר חזרות וזמן חייבים להיות חיוביים");
      return;
    }

    try {
      await axios.post(API_BASE, {
        exercise: selectedExercise,
        repetitions: repsValue,
        duration: durationValue,
      });
      const response = await axios.get(API_BASE);
      setWorkouts(response.data);
      showSuccess("התרגיל נשלח ונשמר בהצלחה!");
      setSelectedExercise("");
      setRepetitions("");
      setDuration("");
      setSearchTerm("");
      setFilteredWorkouts([]);
    } catch (error) {
      console.error(error);
      showError("שגיאה בשליחה לשרת");
    }
  };

  const handleDelete = async (workoutId) => {
    try {
      await axios.delete(`${API_BASE}/${workoutId}`);
      const response = await axios.get(API_BASE);
      setWorkouts(response.data);
      showSuccess("האימון נמחק בהצלחה!");
      setFilteredWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    } catch (error) {
      console.error(error);
      showError("שגיאה במחיקת האימון");
    }
  };

  const handleEdit = (workout) => {
    setEditWorkoutId(workout.id);
    setEditedExercise(workout.exercise);
    setEditedReps(workout.repetitions);
    setEditedDuration(workout.duration);
  };

  const handleCancel = () => {
    setEditWorkoutId(null);
    setEditedExercise("");
    setEditedReps("");
    setEditedDuration("");
  };

  const handleSave = async (id) => {
    const repsValue = Number(editedReps);
    const durationValue = Number(editedDuration);

    if (repsValue < 0 || durationValue < 0) {
      showError("מספר חזרות וזמן חייבים להיות חיוביים");
      return;
    }

    try {
      await axios.put(`${API_BASE}/${id}`, {
        exercise: editedExercise,
        repetitions: repsValue,
        duration: durationValue,
      });
      const response = await axios.get(API_BASE);
      setWorkouts(response.data);
      setEditWorkoutId(null);
      showSuccess("העדכון נשמר בהצלחה!");
      setFilteredWorkouts((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                exercise: editedExercise,
                repetitions: repsValue,
                duration: durationValue,
              }
            : w
        )
      );
    } catch (error) {
      console.error(error);
      showError("שגיאה בעדכון הנתונים");
    }
  };

  const handleSearch = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setFilteredWorkouts([]);
      return;
    }
    const results = workouts.filter((w) => w.exercise === trimmed);
    setFilteredWorkouts(results);
  };

  const handleClear = () => {
    setSearchTerm("");
    setFilteredWorkouts([]);
  };

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

        <Link to="/home" className={classes.topLink}>
          חזור לדף הבית
        </Link>

        <h2 className={classes.title}>הזנת נתוני אימון</h2>

        <div className={classes.inputContainer}>
          <select
            className={classes.input}
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            <option value=""> בחר תרגיל </option>
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
            type="number"
            min="0"
            placeholder="זמן (בשניות)"
            className={classes.input}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
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
                <th>זמן (שניות)</th>
                <th>תאריך</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
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
                        type="number"
                        min="0"
                        value={editedDuration}
                        onChange={(e) => setEditedDuration(e.target.value)}
                        className={classes.inlineInput}
                      />
                    ) : (
                      w.duration
                    )}
                  </td>
                  <td>{new Date(w.created_at).toLocaleDateString("he-IL")}</td>
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
              {displayedWorkouts.length === 0 && (
                <tr>
                  <td colSpan="5" className={classes.noResultsCell}>
                    לא נמצאו תוצאות לתרגיל "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />

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
