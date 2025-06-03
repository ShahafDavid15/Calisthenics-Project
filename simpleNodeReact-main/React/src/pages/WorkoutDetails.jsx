import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./profile.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import React from "react";


export default function WorkoutEntry({ onLogout }) {
  const [selectedExercise, setSelectedExercise] = useState("");
  const [repetitions, setRepetitions] = useState("");
  const [duration, setDuration] = useState("");
  const [workoutList, setWorkoutList] = useState([]);

  const predefinedExercises = [
    "עליות כוח",
    "שכיבות שמיכה",
    "סקוואטים",
    "דיפס",
    "בטן",
  ];

  const handleAddExercise = () => {
    if (!selectedExercise || !repetitions || !duration) {
      alert("יש למלא את כל השדות");
      return;
    }

    const newExercise = {
      exercise: selectedExercise,
      repetitions: Number(repetitions),
      duration: Number(duration),
    };

    setWorkoutList([...workoutList, newExercise]);
    setRepetitions("");
    setDuration("");
  };

  const handleSubmitAll = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/workouts", {
        workouts: workoutList,
      });
      alert("האימון נשמר בהצלחה!");
      setWorkoutList([]);
    } catch (error) {
      console.error(error);
      alert("שגיאה בשליחה לשרת");
    }
  };

  return (
    <div className={classes.container}>
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
            <option value="">-- בחר תרגיל --</option>
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
            placeholder="משך (בשניות)"
            className={classes.input}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <button onClick={handleAddExercise} className={classes.button}>
          הוסף לטבלה
        </button>

        {workoutList.length > 0 && (
          <>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>שם תרגיל</th>
                  <th>חזרות</th>
                  <th>משך (שניות)</th>
                </tr>
              </thead>
              <tbody>
                {workoutList.map((ex, idx) => (
                  <tr key={idx}>
                    <td>{ex.exercise}</td>
                    <td>{ex.repetitions}</td>
                    <td>{ex.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleSubmitAll} className={classes.button}>
              שלח את כל האימון
            </button>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
