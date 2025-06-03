import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./workout.module.css"; // תיצור קובץ CSS תואם
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Workout({ onLogout }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (date && time) {
      const workoutDetails = { date, time };
      console.log("פרטי אימון:", workoutDetails);
      alert(`אימון נקבע ל-${date} בשעה ${time}`);
    } else {
      alert("אנא בחר תאריך ושעה");
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

        <h2 className={classes.title}>הזמנת אימון</h2>

        <form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.inputContainer}>
            <label className={classes.label}>בחר תאריך:</label>
            <input
              type="date"
              className={classes.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className={classes.inputContainer}>
            <label className={classes.label}>בחר שעה:</label>
            <input
              type="time"
              className={classes.input}
              value={time}
              onChange={(e) => setTime(e.target.value)}
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
