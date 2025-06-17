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

  const API_BASE = "http://localhost:3002/api/workout_exercises";

  const predefinedExercises = [
    "עליות כוח",
    "שכיבות שמיכה",
    "סקוואטים",
    "דיפס",
    "בטן",
  ];

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get(API_BASE);
      setWorkouts(response.data);
    } catch (error) {
      console.error(error);
      showError("שגיאה בטעינת נתוני האימונים");
    }
  };

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

    const exerciseData = {
      exercise: selectedExercise,
      repetitions: Number(repetitions),
      duration: Number(duration),
    };

    try {
      await axios.post(API_BASE, exerciseData);
      await fetchWorkouts();
      showSuccess("התרגיל נשלח ונשמר בהצלחה!");
      setSelectedExercise("");
      setRepetitions("");
      setDuration("");
    } catch (error) {
      console.error(error);
      showError("שגיאה בשליחה לשרת");
    }
  };

  const handleDelete = async (workoutId) => {
    try {
      await axios.delete(`${API_BASE}/${workoutId}`);
      await fetchWorkouts();
      showSuccess("האימון נמחק בהצלחה!");
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
    try {
      await axios.put(`${API_BASE}/${id}`, {
        exercise: editedExercise,
        repetitions: Number(editedReps),
        duration: Number(editedDuration),
      });
      await fetchWorkouts();
      setEditWorkoutId(null);
      showSuccess("העדכון נשמר בהצלחה!");
    } catch (error) {
      console.error("Error response:", error.response);
      showError("שגיאה בעדכון הנתונים");
    }
  };

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
            placeholder="מספר חזרות"
            className={classes.input}
            value={repetitions}
            onChange={(e) => setRepetitions(e.target.value)}
          />
        </div>

        <div className={classes.inputContainer}>
          <input
            type="number"
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
          <table className={classes.table}>
            <thead>
              <tr>
                <th className={classes.columnHeaderExercise}>תרגיל</th>
                <th className={classes.columnHeaderRepetitions}>מספר חזרות</th>
                <th className={classes.columnHeaderDuration}>זמן (שניות)</th>
                <th className={classes.columnHeaderDate}>תאריך</th>
                <th className={classes.columnHeaderActions}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((workout) => (
                <tr key={workout.id}>
                  <td>
                    {editWorkoutId === workout.id ? (
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
                      workout.exercise
                    )}
                  </td>
                  <td>
                    {editWorkoutId === workout.id ? (
                      <input
                        type="number"
                        value={editedReps}
                        onChange={(e) => setEditedReps(e.target.value)}
                        className={classes.inlineInput}
                      />
                    ) : (
                      workout.repetitions
                    )}
                  </td>
                  <td>
                    {editWorkoutId === workout.id ? (
                      <input
                        type="number"
                        value={editedDuration}
                        onChange={(e) => setEditedDuration(e.target.value)}
                        className={classes.inlineInput}
                      />
                    ) : (
                      workout.duration
                    )}
                  </td>
                  <td>
                    {new Date(workout.created_at).toLocaleDateString("he-IL")}
                  </td>
                  <td>
                    {editWorkoutId === workout.id ? (
                      <>
                        <button
                          className={`${classes.actionButton} ${classes.saveButton}`}
                          onClick={() => handleSave(workout.id)}
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
                          onClick={() => handleEdit(workout)}
                          className={`${classes.actionButton} ${classes.updateButton}`}
                        >
                          עדכן
                        </button>
                        <button
                          onClick={() => handleDelete(workout.id)}
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
