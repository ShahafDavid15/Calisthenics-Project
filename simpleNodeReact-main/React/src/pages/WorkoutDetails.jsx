import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./profile.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import React from "react";
import MessageModal from "../components/messagemodal/MessageModal";

export default function WorkoutEntry({ onLogout }) {
  const [selectedExercise, setSelectedExercise] = useState("");
  const [repetitions, setRepetitions] = useState("");
  const [duration, setDuration] = useState("");

  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error"); 
  const [showModal, setShowModal] = useState(false);

  const predefinedExercises = [
    "עליות כוח",
    "שכיבות שמיכה",
    "סקוואטים",
    "דיפס",
    "בטן",
  ];

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
      await axios.post("http://localhost:3001/api/workouts", exerciseData);
      showSuccess("התרגיל נשלח ונשמר בהצלחה!");
      setSelectedExercise("");
      setRepetitions("");
      setDuration("");
    } catch (error) {
      console.error(error);
      showError("שגיאה בשליחה לשרת");
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

        <button onClick={handleSubmitExercise} className={classes.button}>
          שלח
        </button>
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
