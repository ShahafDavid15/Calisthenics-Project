import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import MessageModal from "../components/messagemodal/MessageModal";
import classes from "./workout.module.css";

export default function Workout({ onLogout, currentUser }) {
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    type: "info",
    confirmable: false,
    onConfirm: null,
  });
  const [participants, setParticipants] = useState({});
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const daysAhead = 6;
  const defaultHours = ["17:00", "18:00", "19:00", "20:00"];
  const fridayHours = ["10:00", "11:00", "12:00"];

  const generateSchedule = () => {
    const schedule = [];
    let addedDays = 0;
    let offset = 0;

    while (addedDays < daysAhead) {
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + offset);
      offset++;
      if (dateObj.getDay() === 6) continue; // שבת

      const dayName = dateObj.toLocaleDateString("he-IL", { weekday: "long" });
      const dateStr = dateObj.toISOString().split("T")[0];
      const hours = dateObj.getDay() === 5 ? fridayHours : defaultHours;

      schedule.push({ day: dayName, date: dateStr, hours });
      addedDays++;
    }
    return schedule;
  };

  const scheduleData = generateSchedule();

  const normalizeDate = (dateStr) => dateStr.trim();
  const normalizeTime = (timeStr) => timeStr.trim().slice(0, 5);

  const loadParticipants = async () => {
    try {
      const res = await fetch(
        "http://localhost:3002/api/user-workouts/all-participants"
      );
      const data = await res.json();

      const normalized = {};
      Object.entries(data).forEach(([key, count]) => {
        const [date, time] = key.split("|");
        const shortTime = time.slice(0, 5);
        const newKey = `${date}|${shortTime}`;
        normalized[newKey] = count;
      });

      setParticipants(normalized);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching participants:", err);
    }
  };

  useEffect(() => {
    const fetchUserWorkouts = async () => {
      if (!currentUser?.id) {
        setUserWorkouts([]);
        return;
      }
      try {
        const res = await fetch(
          `http://localhost:3002/api/user-workouts?user_id=${currentUser.id}`
        );
        const data = await res.json();
        setUserWorkouts(data);
      } catch {
        setUserWorkouts([]);
      }
    };

    loadParticipants();
    fetchUserWorkouts();
  }, [currentUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadParticipants();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const workoutsThisWeek = userWorkouts.filter((w) => {
    const workoutDate = new Date(w.workout_date);
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);
    return workoutDate >= now && workoutDate <= weekFromNow;
  });

  const userHasBookedSlot = (date, hour) => {
    return userWorkouts.some((w) => {
      const wDate = normalizeDate(w.workout_date);
      const wTime = normalizeTime(w.workout_time);
      return wDate === date && wTime === hour;
    });
  };

  const userHasWorkoutOnDate = (date) =>
    userWorkouts.some((w) => normalizeDate(w.workout_date) === date);

  const handleHourClick = (date, hour) => {
    const key = `${date}|${hour}`;
    const count = participants[key] ?? 0;

    if (count >= 10) return;

    if (workoutsThisWeek.length >= 3) {
      setMessage({
        text: "ניתן להירשם ל־3 אימונים בלבד בשבוע.",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
      return;
    }

    if (userHasWorkoutOnDate(date)) {
      setMessage({
        text: "לא ניתן להירשם ליותר מאימון אחד ביום.",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
      return;
    }

    if (userHasBookedSlot(date, hour)) {
      setMessage({
        text: "כבר נרשמת לאימון זה.",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
      return;
    }

    setMessage({
      text: `האם אתה בטוח שברצונך להירשם לאימון בתאריך ${date} בשעה ${hour}?`,
      type: "info",
      confirmable: true,
      onConfirm: () => confirmBooking(date, hour),
    });
    setShowMessage(true);
  };

  const confirmBooking = async (date, hour) => {
    setShowMessage(false);

    try {
      const response = await fetch("http://localhost:3002/api/user-workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          workout_date: date,
          workout_time: hour,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 409) {
          setMessage({
            text: "כבר נרשמת לאימון זה או שיש לך אימון באותו יום.",
            type: "error",
            confirmable: false,
          });
          setShowMessage(true);
          return;
        }
        throw new Error(`Error booking workout: ${response.status} ${errText}`);
      }

      await loadParticipants();

      const userRes = await fetch(
        `http://localhost:3002/api/user-workouts?user_id=${currentUser.id}`
      );
      const userData = await userRes.json();
      setUserWorkouts(userData);

      setMessage({
        text: "נרשמת בהצלחה לאימון!",
        type: "info",
        confirmable: false,
      });
      setShowMessage(true);
    } catch (err) {
      setMessage({
        text: err.message || "שגיאה כללית.",
        type: "error",
        confirmable: false,
      });
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
            onConfirm={message.confirmable ? message.onConfirm : null}
          />
        )}

        <Link to="/home" className={classes.topLink}>
          חזור לדף הבית
        </Link>

        <h2 className={classes.title}>לוח אימונים</h2>

        <div key={refreshKey} className={classes.scheduleGrid}>
          {scheduleData.map(({ day, date, hours }) => (
            <div key={date} className={classes.dayRow}>
              <div className={classes.dayLabel}>
                {day} -{" "}
                <span style={{ direction: "ltr", display: "inline-block" }}>
                  {date.split("-")[2]} / {date.split("-")[1]} /{" "}
                  {date.split("-")[0]}
                </span>
              </div>
              <div className={classes.hoursRow}>
                {hours.map((hour) => {
                  const key = `${date}|${hour}`;
                  const count = participants[key] ?? 0;
                  const isFull = count >= 10;
                  const isBookedByUser = userHasBookedSlot(date, hour);

                  const status = isBookedByUser
                    ? "אתה רשום לאימון זה"
                    : isFull
                    ? "הרשימה סגורה"
                    : `${count} מתוך 10 נרשמו`;

                  return (
                    <div
                      key={hour}
                      className={`${classes.hourBox} ${
                        isFull ? classes.full : ""
                      } ${isBookedByUser ? classes.bookedByUser : ""}`}
                      onClick={() => handleHourClick(date, hour)}
                      style={{ cursor: isFull ? "not-allowed" : "pointer" }}
                    >
                      {hour}
                      <div className={classes.participantCount}>{status}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
