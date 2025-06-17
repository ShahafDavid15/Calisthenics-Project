import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./workout.module.css"; 
import MessageModal from "../components/messagemodal/MessageModal";
import { useState } from "react";
import { Link } from "react-router-dom";
import React from "react";

export default function Workout({ onLogout }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "info" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (date && time) {
      try {
        const response = await fetch("http://localhost:3001/api/workouts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ workout_time: time, workout_date: date }),
        });
  
        if (!response.ok) throw new Error("שגיאה בשליחה לשרת");
  
        setMessage({
          text: `אימון נקבע ל-${date} בשעה ${time}`,
          type: "info",
        });
        setShowMessage(true);
        setDate("");
        setTime("");
      } catch (err) {
        setMessage({ text: "שגיאה בשליחה לשרת", type: "error" });
        setShowMessage(true);
      }
    } else {
      setMessage({ text: "אנא בחר תאריך ושעה", type: "error" });
      setShowMessage(true);
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

        {showMessage && (
          <MessageModal
            message={message.text}
            type={message.type}
            onClose={() => setShowMessage(false)}
           />
        )}


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
