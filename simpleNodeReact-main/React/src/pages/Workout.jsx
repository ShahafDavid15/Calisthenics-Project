import React, { useState, useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import MessageModal from "../components/messagemodal/MessageModal";
import classes from "./workout.module.css";

/** Returns upcoming Friday date from a given date */
function getUpcomingFriday(fromDate) {
  const day = fromDate.getDay();
  let daysToAdd = 5 - day;
  if (daysToAdd < 0) daysToAdd = 0;
  const friday = new Date(fromDate);
  friday.setDate(friday.getDate() + daysToAdd);
  friday.setHours(0, 0, 0, 0);
  return friday;
}

/** Returns ISO week number */
function getWeekNumber(d) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const dayNumber = day === 0 ? 1 : day + 1;
  date.setDate(date.getDate() + (7 - dayNumber));
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date - firstDayOfYear;
  return Math.ceil((diff / 86400000 + 1) / 7);
}

export default function Workout({ onLogout, currentUser }) {
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    type: "info",
    confirmable: false,
    onConfirm: null,
    confirmText: "אישור",
    cancelText: "ביטול",
  });
  const [participants, setParticipants] = useState({});
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeMembership, setActiveMembership] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newWorkoutDate, setNewWorkoutDate] = useState("");
  const [newWorkoutTime, setNewWorkoutTime] = useState("");
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [editWorkoutTime, setEditWorkoutTime] = useState("");

  const isAdmin =
    currentUser?.name === "admin" || currentUser?.role === "admin";

  const normalizeDate = (dateStr) => dateStr.trim();
  const normalizeTime = (timeStr) => timeStr.trim().slice(0, 5);

  // Fetch JSON from response or fallback to text
  async function fetchJsonOrText(res) {
    try {
      return await res.json();
    } catch {
      return await res.text();
    }
  }

  /* Load active membership for current user */
  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchMembership = async () => {
      try {
        const res = await fetch(
          `http://localhost:3002/api/purchases/active-membership?user_id=${currentUser.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch membership");
        const data = await res.json();
        setActiveMembership(data);
      } catch {
        setActiveMembership(null);
      }
    };
    fetchMembership();
  }, [currentUser]);

  /* Load participants count */
  const loadParticipants = async () => {
    try {
      const res = await fetch(
        "http://localhost:3002/api/user-workouts/all-participants"
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const normalized = {};
      Object.entries(data).forEach(([key, count]) => {
        const [dateStr, time] = key.split("|");
        const dateObj = new Date(dateStr);
        const isoDate = dateObj.toISOString().slice(0, 10);
        const shortTime = time.slice(0, 5);
        normalized[`${isoDate}|${shortTime}`] = count;
      });
      setParticipants(normalized);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setMessage({
        text: err.message || "Error loading participants",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
    }
  };

  /* Load workouts from DB */
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
        return d >= today && d <= friday && d.getDay() !== 6;
      });

      const grouped = {};
      filteredData.forEach(({ workout_date, workout_time, workout_id }) => {
        if (!grouped[workout_date]) grouped[workout_date] = [];
        grouped[workout_date].push({ time: workout_time, id: workout_id });
      });

      const formatted = Object.entries(grouped).map(([date, hours]) => {
        const dateObj = new Date(date);
        const dayName = dateObj.toLocaleDateString("he-IL", {
          weekday: "long",
        });
        return {
          day: dayName,
          date,
          hours: hours.sort((a, b) => a.time.localeCompare(b.time)),
        };
      });

      formatted.sort((a, b) => new Date(a.date) - new Date(b.date));
      setScheduleData(formatted);
    } catch (err) {
      setMessage({
        text: err.message || "Error loading workouts",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
    }
  };

  /* Load user booked workouts and participant counts */
  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchUserWorkouts = async () => {
      try {
        const res = await fetch(
          `http://localhost:3002/api/user-workouts?user_id=${currentUser.id}`
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setUserWorkouts(data);
      } catch {
        setUserWorkouts([]);
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

  // Check if the user has booked a specific slot
  const userHasBookedSlot = (date, hour) =>
    userWorkouts.some(
      (w) =>
        normalizeDate(w.workout_date) === date &&
        normalizeTime(w.workout_time) === hour
    );

  // Check if the user has any workout on a specific date
  const userHasWorkoutOnDate = (date) =>
    userWorkouts.some((w) => normalizeDate(w.workout_date) === date);

  // Handler for user clicking on a workout hour
  const handleHourClick = (date, hour) => {
    if (!activeMembership || !activeMembership.membership_name) {
      setMessage({
        text: "יש לרכוש מנוי כדי להירשם לאימון.",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
      return;
    }

    const key = `${date}|${hour}`;
    const count = participants[key] ?? 0;
    if (count >= 5) return;

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

    let maxWorkouts = 3;
    const membershipName = (
      activeMembership.name ||
      activeMembership.membership_name ||
      ""
    )
      .trim()
      .toLowerCase();

    if (membershipName === "basic") maxWorkouts = 1;
    else if (membershipName === "standard") maxWorkouts = 2;
    else if (membershipName === "premium") maxWorkouts = 3;

    if (workoutsThisWeek.length >= maxWorkouts) {
      setMessage({
        text: `ניתן להירשם עד ${maxWorkouts} אימונים בשבוע.`,
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
      return;
    }

    if (userHasWorkoutOnDate(date)) {
      setMessage({
        text: "ניתן להירשם לאימון אחד בלבד ביום.",
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

  // Confirm booking for a user
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
          membership_name:
            activeMembership?.name?.trim() ||
            activeMembership?.membership_name?.trim() ||
            "",
        }),
      });
      if (!res.ok) throw new Error(await fetchJsonOrText(res));

      await loadParticipants();
      const userRes = await fetch(
        `http://localhost:3002/api/user-workouts?user_id=${currentUser.id}`
      );
      setUserWorkouts(await userRes.json());

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

  // Delete a workout
  const handleDeleteWorkout = async (workoutId) => {
    setMessage({
      text: "האם אתה בטוח שברצונך למחוק את האימון?",
      type: "info",
      confirmable: true,
      onConfirm: async () => {
        try {
          const res = await fetch(
            `http://localhost:3002/api/workouts/${workoutId}`,
            {
              method: "DELETE",
            }
          );
          if (!res.ok) throw new Error(await fetchJsonOrText(res));
          await loadWorkoutsFromDB();
          setShowMessage(false);
        } catch (err) {
          setMessage({
            text: err.message || "שגיאה במחיקה",
            type: "error",
            confirmable: false,
          });
          setShowMessage(true);
        }
      },
    });
    setShowMessage(true);
  };

  // adding a new workout
  const handleAddWorkout = () => {
    setNewWorkoutDate("");
    setNewWorkoutTime("");
    setIsAdding(true);
  };

  // Cancel adding new workout
  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewWorkoutDate("");
    setNewWorkoutTime("");
  };

  // Submit new workout to DB
  const submitAddWorkout = async () => {
    if (!newWorkoutDate || !newWorkoutTime) return;

    const selectedDateTime = new Date(`${newWorkoutDate}T${newWorkoutTime}`);
    const dayOfWeek = selectedDateTime.getDay();
    if (dayOfWeek === 6) {
      setMessage({
        text: "לא ניתן להוסיף אימון בשבת.",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
      return;
    }

    const now = new Date();
    if (selectedDateTime < now) {
      setMessage({
        text: "לא ניתן להוסיף אימון לתאריך שכבר עבר.",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
      return;
    }

    const exists = scheduleData.some(
      (day) =>
        day.date === newWorkoutDate &&
        day.hours.some((hour) => hour.time === newWorkoutTime)
    );
    if (exists) {
      setMessage({
        text: "כבר קיים אימון באותו תאריך ושעה.",
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
        body: JSON.stringify({
          workout_date: newWorkoutDate,
          workout_time: newWorkoutTime,
        }),
      });
      if (!res.ok) throw new Error(await fetchJsonOrText(res));
      setIsAdding(false);
      await loadWorkoutsFromDB();
    } catch (err) {
      setMessage({
        text: err.message || "שגיאה ביצירת אימון",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
    }
  };

  // editing an existing workout
  const startEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setEditWorkoutTime(workout.time);
  };

  const submitEditWorkout = async () => {
    if (!editWorkoutTime) return;

    const exists = scheduleData.some(
      (day) =>
        day.date === editingWorkout.date &&
        day.hours.some(
          (hour) =>
            hour.time === editWorkoutTime && hour.id !== editingWorkout.id
        )
    );
    if (exists) {
      setMessage({
        text: "כבר קיים אימון בשעה הזאת ביום זה.",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
      return;
    }

    const selectedDateTime = new Date(
      `${editingWorkout.date}T${editWorkoutTime}`
    );
    if (selectedDateTime < new Date()) {
      setMessage({
        text: "לא ניתן לעדכן אימון לשעה שכבר עברה.",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3002/api/workouts/${editingWorkout.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workout_time: editWorkoutTime,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "שגיאה בעדכון האימון");
      }

      setEditingWorkout(null);
      await loadWorkoutsFromDB();

      setMessage({
        text: "האימון עודכן בהצלחה.",
        type: "info",
        confirmable: false,
      });
      setShowMessage(true);
    } catch (err) {
      setMessage({
        text: err.message || "שגיאה בעדכון האימון",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
    }
  };

  // function that checks if the workout time has already passed
  const hasWorkoutPassed = (date, time) => {
    const workoutDateTime = new Date(`${date}T${time}`);
    return workoutDateTime < new Date();
  };

  // Render component
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

        <h2 className={classes.title}>אימונים</h2>

        {/* Add workout button */}
        {isAdmin && !isAdding && (
          <button
            onClick={handleAddWorkout}
            className={classes.addWorkoutButton}
          >
            הוספת אימון חדש
          </button>
        )}

        {/* Inline add workout form */}
        {isAdmin && isAdding && (
          <div className={classes.addWorkoutForm}>
            <h3>הוספת אימון חדש</h3>
            <input
              type="date"
              value={newWorkoutDate}
              onChange={(e) => {
                setNewWorkoutDate(e.target.value);
              }}
            />

            <input
              type="time"
              value={newWorkoutTime}
              onChange={(e) => setNewWorkoutTime(e.target.value)}
            />
            <div className={classes.editButtons}>
              <button className={classes.saveBtn} onClick={submitAddWorkout}>
                הוספה
              </button>
              <button className={classes.cancelBtn} onClick={handleCancelAdd}>
                ביטול
              </button>
            </div>
          </div>
        )}

        <div key={refreshKey} className={classes.scheduleGrid}>
          {scheduleData.map(({ day, date, hours }) => (
            <div key={date} className={classes.dayRow}>
              <div className={classes.dayLabel}>
                {day} - <span>{date.split("-").reverse().join("/")}</span>
              </div>
              <div className={classes.hoursRow}>
                {hours.map(({ time, id }) => {
                  const key = `${date}|${time}`;
                  const count = participants[key] ?? 0;
                  const isFull = count >= 5;
                  const isBookedByUser = userHasBookedSlot(date, time);
                  const isPassed = hasWorkoutPassed(date, time);

                  return (
                    <div key={id} className={classes.hourContainer}>
                      <div
                        className={`${classes.hourBox} 
                          ${isFull ? classes.full : ""} 
                          ${isBookedByUser ? classes.bookedByUser : ""} 
                          ${isPassed ? classes.passed : ""}`}
                        onClick={() => {
                          if (!isAdmin && !isPassed)
                            handleHourClick(date, time);
                        }}
                      >
                        {editingWorkout?.id === id ? (
                          <input
                            type="time"
                            value={editWorkoutTime}
                            onChange={(e) => setEditWorkoutTime(e.target.value)}
                          />
                        ) : (
                          <>
                            <span className={classes.timeText}>{time}</span>
                            <span className={classes.participantsText}>
                              {isBookedByUser
                                ? "אתה רשום לאימון זה"
                                : isFull
                                ? "מלא"
                                : isPassed
                                ? "עבר"
                                : `נרשמו ${count}/5`}
                            </span>
                          </>
                        )}
                      </div>

                      {isAdmin && editingWorkout?.id === id ? (
                        <div className={classes.editButtons}>
                          <button
                            className={classes.saveBtn}
                            onClick={submitEditWorkout}
                          >
                            שמור
                          </button>
                          <button
                            className={classes.cancelBtn}
                            onClick={() => setEditingWorkout(null)}
                          >
                            ביטול
                          </button>
                        </div>
                      ) : isAdmin ? (
                        <div className={classes.adminButtons}>
                          <button
                            className={classes.editBtn}
                            onClick={() => startEditWorkout({ id, date, time })}
                          >
                            עריכה
                          </button>
                          <button
                            className={classes.deleteBtn}
                            onClick={() => handleDeleteWorkout(id)}
                          >
                            מחיקה
                          </button>
                        </div>
                      ) : null}
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
