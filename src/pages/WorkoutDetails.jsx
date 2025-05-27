import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./profile.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function WorkoutEntry({ onLogout }) {
  const [exerciseName, setExerciseName] = useState("");
  const [repetitions, setRepetitions] = useState("");
  const [duration, setDuration] = useState(""); // זמן בדקות

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (exerciseName && repetitions && duration) {
      const workoutData = {
        exercise_name: exerciseName,
        repetitions: Number(repetitions),
        duration: Number(duration),
      };

      try {
        // שליחה לשרת (תשנה את ה-URL לפי ה-API שלך)
        const response = await axios.post(
          "http://localhost:3001/api/workout_exercise",
          workoutData
        );
        alert("אימון נשמר בהצלחה!");
        // איפוס השדות
        setExerciseName("");
        setRepetitions("");
        setDuration("");
      } catch (error) {
        console.error(error);
        alert("הייתה שגיאה בשמירת האימון");
      }
    } else {
      alert("אנא מלא את כל השדות");
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

        <form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.inputContainer}>
            <input
              type="text"
              placeholder="שם התרגיל"
              className={classes.input}
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
          </div>

          <div className={classes.inputContainer}>
            <input
              type="number"
              placeholder="מספר חזרות"
              className={classes.input}
              value={repetitions}
              min="1"
              onChange={(e) => setRepetitions(e.target.value)}
            />
          </div>

          <div className={classes.inputContainer}>
            <input
              type="number"
              placeholder="משך הזמן (בדקות)"
              className={classes.input}
              value={duration}
              min="1"
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <button type="submit" className={classes.button}>
            שלח
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
