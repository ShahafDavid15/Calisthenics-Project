import React, { useState, useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import MessageModal from "../components/messagemodal/MessageModal";
import classes from "./workout.module.css";

/**
 * Calculate the ISO 8601 week number for a given date
 * @param {Date} d - input date
 * @returns {number} week number in the year
 */
function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7; // Sunday as 7 instead of 0
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

/**
 * Returns a Date object representing the upcoming Friday (or today if it's Friday or later in week)
 * @param {Date} fromDate - the base date
 * @returns {Date} date of Friday this week or today if today is Friday or later
 */
function getUpcomingFriday(fromDate) {
  const day = fromDate.getDay(); // 0=Sunday ... 6=Saturday
  // Calculate days to add to get Friday (5)
  let daysToAdd = 5 - day;
  if (daysToAdd < 0) daysToAdd = 0; // If today is Friday (5) or later (Sat 6), take today
  const friday = new Date(fromDate);
  friday.setDate(friday.getDate() + daysToAdd);
  friday.setHours(0, 0, 0, 0);
  return friday;
}

export default function Workout({ onLogout, currentUser }) {
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    type: "info", // info, error, warning, etc.
    confirmable: false,
    onConfirm: null,
    confirmText: "אישור",
    cancelText: "ביטול",
  });

  const [participants, setParticipants] = useState({});
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [scheduleData, setScheduleData] = useState([]);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [updateWorkout, setUpdateWorkout] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const normalizeDate = (dateStr) => dateStr.trim();
  const normalizeTime = (timeStr) => timeStr.trim().slice(0, 5);

  async function fetchJsonOrText(res) {
    try {
      return await res.json();
    } catch {
      return await res.text();
    }
  }

  const loadParticipants = async () => {
    try {
      const res = await fetch(
        "http://localhost:3002/api/user-workouts/all-participants"
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const normalized = {};
      Object.entries(data).forEach(([key, count]) => {
        // key כמו "Mon Aug 11 2025 00:00:00 GMT+0300 (שעון ישראל (קיץ))|17:00"
        const [dateStr, time] = key.split("|");

        // המרת מחרוזת תאריך לפורמט ISO קצר YYYY-MM-DD
        const dateObj = new Date(dateStr);
        const isoDate = dateObj.toISOString().slice(0, 10); // "2025-08-11"

        const shortTime = time.slice(0, 5); // "17:00"

        normalized[`${isoDate}|${shortTime}`] = count;
      });
      setParticipants(normalized);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching participants:", err);
      setMessage({
        text: err.message || "שגיאה בטעינת משתתפים",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
    }
  };

  const loadWorkoutsFromDB = async () => {
    try {
      const res = await fetch("http://localhost:3002/api/workouts");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const friday = getUpcomingFriday(today);

      const filteredData = data.filter(({ workout_date }) => {
        const d = new Date(workout_date);
        d.setHours(0, 0, 0, 0);
        return d >= today && d <= friday;
      });

      const grouped = {};
      filteredData.forEach(({ workout_date, workout_time }) => {
        if (!grouped[workout_date]) grouped[workout_date] = [];
        grouped[workout_date].push(workout_time);
      });

      const formatted = Object.entries(grouped).map(([date, hours]) => {
        const dateObj = new Date(date);
        const dayName = dateObj.toLocaleDateString("he-IL", {
          weekday: "long",
        });
        return { day: dayName, date, hours: hours.sort() };
      });

      formatted.sort((a, b) => new Date(a.date) - new Date(b.date));
      setScheduleData(formatted);
    } catch (err) {
      console.error("Error loading workouts:", err);
      setMessage({
        text: err.message || "שגיאה בטעינת אימונים",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
    }
  };

  useEffect(() => {
    if (!currentUser?.id) {
      setUserWorkouts([]);
      setMessage({ text: "", type: "info", confirmable: false });
      setShowMessage(false);
      return;
    }

    const fetchUserWorkouts = async () => {
      try {
        const res = await fetch(
          `http://localhost:3002/api/user-workouts?user_id=${currentUser.id}`
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setUserWorkouts(data);
      } catch (err) {
        console.error("Error fetching user workouts:", err);
        setUserWorkouts([]);
        setMessage({
          text: err.message || "",
          type: "info",
          confirmable: false,
        });
        setShowMessage(false);
      }
    };

    fetchUserWorkouts();
    loadParticipants();
    loadWorkoutsFromDB();
  }, [currentUser]);

  useEffect(() => {
    const interval = setInterval(() => loadParticipants(), 5000);
    return () => clearInterval(interval);
  }, []);

  const userHasBookedSlot = (date, hour) =>
    userWorkouts.some(
      (w) =>
        normalizeDate(w.workout_date) === date &&
        normalizeTime(w.workout_time) === hour
    );

  const userHasWorkoutOnDate = (date) =>
    userWorkouts.some((w) => normalizeDate(w.workout_date) === date);

  const isWorkoutExists = (date, time) => {
    for (const day of scheduleData) {
      if (day.date === date) {
        if (day.hours.includes(time)) {
          return true;
        }
      }
    }
    return false;
  };

  const handleHourClick = (date, hour) => {
    const key = `${date}|${hour}`;
    const count = participants[key] ?? 0;
    if (count >= 10) return;

    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();

    const workoutsThisWeek = userWorkouts.filter((w) => {
      const workoutDate = new Date(w.workout_date);
      return (
        workoutDate.getFullYear() === currentYear &&
        getWeekNumber(workoutDate) === currentWeek
      );
    });

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
      const res = await fetch("http://localhost:3002/api/user-workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          workout_date: date,
          workout_time: hour,
        }),
      });
      if (!res.ok) {
        const errData = await fetchJsonOrText(res);
        throw new Error(
          typeof errData === "string" ? errData : JSON.stringify(errData)
        );
      }

      await loadParticipants();

      const userRes = await fetch(
        `http://localhost:3002/api/user-workouts?user_id=${currentUser.id}`
      );
      if (!userRes.ok) throw new Error(await userRes.text());
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

  const handleAddWorkout = async (e) => {
    e.preventDefault();

    const today = new Date();
    const selectedDate = new Date(newDate);

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setMessage({
        text: "לא ניתן להוסיף אימון לתאריך שעבר.",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
      return;
    }

    if (isWorkoutExists(newDate, newTime)) {
      setMessage({
        text: "כבר קיים אימון בשעה ובתאריך האלה.",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
      return;
    }

    try {
      const res = await fetch("http://localhost:3002/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workout_date: newDate, workout_time: newTime }),
      });
      if (!res.ok) {
        const errData = await fetchJsonOrText(res);
        throw new Error(
          typeof errData === "string" ? errData : JSON.stringify(errData)
        );
      }

      setMessage({
        text: "האימון נוסף בהצלחה!",
        type: "info",
        confirmable: false,
      });
      setShowMessage(true);
      setNewDate("");
      setNewTime("");
      loadWorkoutsFromDB();
      loadParticipants();
      setShowAddForm(false);
    } catch (err) {
      setMessage({ text: err.message, type: "error", confirmable: false });
      setShowMessage(true);
    }
  };

  const requestDeleteWorkout = (date, hour, e) => {
    e.stopPropagation();
    setConfirmDelete({ date, hour });
  };

  const confirmDeleteWorkout = async () => {
    if (!confirmDelete) return;
    const { date, hour } = confirmDelete;
    setShowMessage(false);
    try {
      const res = await fetch("http://localhost:3002/api/workouts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workout_date: date, workout_time: hour }),
      });
      if (!res.ok) {
        const errData = await fetchJsonOrText(res);
        throw new Error(
          typeof errData === "string" ? errData : JSON.stringify(errData)
        );
      }

      setMessage({
        text: "האימון נמחק בהצלחה!",
        type: "info",
        confirmable: false,
      });
      setShowMessage(true);
      loadWorkoutsFromDB();
      loadParticipants();
    } catch (err) {
      setMessage({ text: err.message, type: "error", confirmable: false });
      setShowMessage(true);
    }
    setConfirmDelete(null);
  };

  const handleUpdateWorkout = (date, hour, e) => {
    e.stopPropagation();
    setUpdateWorkout({
      workout_date: date,
      workout_time: hour,
      new_time: hour,
    });
  };

  const saveUpdatedWorkout = async (date, hour, newTime) => {
    if (isWorkoutExists(date, newTime)) {
      setMessage({
        text: "כבר קיים אימון בשעה ובתאריך האלה.",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
      return;
    }

    try {
      const res = await fetch("http://localhost:3002/api/workouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workout_date: date,
          workout_time: hour,
          new_time: newTime,
        }),
      });
      if (!res.ok) {
        const errData = await fetchJsonOrText(res);
        throw new Error(
          typeof errData === "string" ? errData : JSON.stringify(errData)
        );
      }

      setMessage({
        text: "האימון עודכן בהצלחה!",
        type: "info",
        confirmable: false,
      });
      setShowMessage(true);
      setUpdateWorkout(null);
      loadWorkoutsFromDB();
      loadParticipants();
    } catch (err) {
      setMessage({ text: err.message, type: "error", confirmable: false });
      setShowMessage(true);
    }
  };

  return (
    <div className={classes.container}>
      <Header />
      <NavBar currentUser={currentUser} />
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
            confirmText={message.confirmText}
            cancelText={message.cancelText}
          />
        )}

        {confirmDelete && (
          <MessageModal
            message={`למחוק את האימון בתאריך ${confirmDelete.date} בשעה ${confirmDelete.hour}?`}
            type="warning"
            onClose={() => setConfirmDelete(null)}
            onConfirm={confirmDeleteWorkout}
            confirmText="כן, מחק"
            cancelText="ביטול"
          />
        )}

        <h2 className={classes.title}>לוח אימונים</h2>

        {currentUser?.name === "admin" && (
          <>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={classes.button}
              style={{ marginBottom: "1rem" }}
            >
              {showAddForm ? "בטל הוספת אימון" : "הוסף אימון חדש"}
            </button>

            {showAddForm && (
              <form onSubmit={handleAddWorkout} className={classes.form}>
                <div className={classes.inputContainer}>
                  <label className={classes.label}>תאריך:</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className={classes.input}
                    required
                  />
                </div>
                <div className={classes.inputContainer}>
                  <label className={classes.label}>שעה:</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className={classes.input}
                    required
                  />
                </div>
                <button type="submit" className={classes.button}>
                  הוסף
                </button>
              </form>
            )}
          </>
        )}

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
                  const key = `${date}|${hour.slice(0, 5)}`;
                  const count = participants[key] ?? 0;
                  const isFull = count >= 10;
                  const isBookedByUser = userHasBookedSlot(date, hour);
                  const status = isBookedByUser
                    ? "אתה רשום לאימון זה"
                    : isFull
                    ? "הרשימה סגורה"
                    : `${count} מתוך 10 נרשמו`;

                  return (
                    <div key={hour} className={classes.hourContainer}>
                      <div
                        className={`${classes.hourBox} ${
                          isFull ? classes.full : ""
                        } ${isBookedByUser ? classes.bookedByUser : ""}`}
                        onClick={() => handleHourClick(date, hour)}
                        style={{ cursor: isFull ? "not-allowed" : "pointer" }}
                      >
                        {hour}
                        <div className={classes.participantCount}>{status}</div>
                      </div>

                      {currentUser?.name === "admin" && (
                        <div className={classes.actionButtons}>
                          {updateWorkout &&
                          updateWorkout.workout_date === date &&
                          updateWorkout.workout_time === hour ? (
                            <>
                              <input
                                type="time"
                                value={updateWorkout.new_time ?? hour}
                                onChange={(e) =>
                                  setUpdateWorkout((prev) => ({
                                    ...prev,
                                    new_time: e.target.value,
                                  }))
                                }
                                className={classes.timeInput}
                              />
                              <button
                                onClick={() =>
                                  saveUpdatedWorkout(
                                    date,
                                    hour,
                                    updateWorkout.new_time
                                  )
                                }
                                className={classes.updateButton}
                              >
                                שמור
                              </button>
                              <button
                                onClick={() => setUpdateWorkout(null)}
                                className={classes.deleteButton}
                              >
                                ביטול
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) =>
                                  handleUpdateWorkout(date, hour, e)
                                }
                                className={classes.updateButton}
                              >
                                ערוך
                              </button>
                              <button
                                onClick={(e) =>
                                  requestDeleteWorkout(date, hour, e)
                                }
                                className={classes.deleteButton}
                              >
                                מחק
                              </button>
                            </>
                          )}
                        </div>
                      )}
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
