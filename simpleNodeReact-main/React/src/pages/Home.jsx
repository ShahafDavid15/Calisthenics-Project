import React, { useEffect, useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import MessageModal from "../components/messagemodal/MessageModal";
import classes from "./home.module.css";
import calisthenicsImg from "../images/Calisthenics.jpeg";

export default function Home({ onLogout, currentUser }) {
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [message, setMessage] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(null);

  useEffect(() => {
    const fetchUserWorkouts = async () => {
      if (!currentUser?.id) return;
      try {
        const res = await fetch(
          `http://localhost:3002/api/user-workouts?user_id=${currentUser.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch workouts");
        const data = await res.json();
        setUserWorkouts(data);
      } catch {
        setUserWorkouts([]);
      }
    };
    fetchUserWorkouts();
  }, [currentUser]);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  };

  const isPastWorkout = (workoutDate, workoutTime) => {
    const now = new Date();
    const workoutDateTime = new Date(`${workoutDate}T${workoutTime}:00`);
    return workoutDateTime <= now;
  };

  const handleCancelClick = (id, workoutDate, workoutTime) => {
    setConfirmCancel({ id, workoutDate, workoutTime });
  };

  const confirmCancelWorkout = async () => {
    if (!confirmCancel) return;

    const { id, workoutDate, workoutTime } = confirmCancel;
    const now = new Date();
    const workoutDateTime = new Date(`${workoutDate}T${workoutTime}:00`);

    if (workoutDateTime <= now) {
      setMessage("לא ניתן לבטל אימון שכבר עבר.");
      setConfirmCancel(null);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3002/api/user-workouts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      setUserWorkouts((prev) => prev.filter((w) => w.id !== id));
      setMessage("האימון בוטל בהצלחה.");
    } catch {
      setMessage("שגיאה בביטול האימון.");
    }
    setConfirmCancel(null);
  };

  const registeredWorkoutsCount = userWorkouts.length;
  const maxWorkouts = currentUser?.maxWorkouts ?? 3;

  return (
    <div className={classes.container}>
      <Header />
      <NavBar currentUser={currentUser} />

      <button onClick={onLogout} className={classes.logoutButton}>
        התנתקות
      </button>

      <main className={classes.main}>
        {userWorkouts.length > 0 && (
          <div className={classes.userWorkouts}>
            <h3>:האימונים שלך</h3>
            <p>
              {registeredWorkoutsCount} / {maxWorkouts} :אימונים שנרשמת אליהם
            </p>

            {registeredWorkoutsCount === maxWorkouts && (
              <p>מומשו כל ההרשמות לשבוע</p>
            )}

            <ul className={classes.workoutList}>
              {userWorkouts.map((w) => {
                const past = isPastWorkout(w.workout_date, w.workout_time);
                return (
                  <li
                    key={w.id}
                    className={classes.workoutItem}
                    style={{ color: past ? "gray" : "black" }}
                  >
                    אימון בתאריך {formatDate(w.workout_date)} בשעה{" "}
                    {w.workout_time}
                    {!past && (
                      <button
                        onClick={() =>
                          handleCancelClick(
                            w.id,
                            w.workout_date,
                            w.workout_time
                          )
                        }
                        className={classes.cancelButton}
                        type="button"
                      >
                        ביטול
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {confirmCancel && (
          <MessageModal
            message={`בטוח שברצונך לבטל את האימון בתאריך ${formatDate(
              confirmCancel.workoutDate
            )} בשעה ${confirmCancel.workoutTime}?`}
            type="warning"
            onClose={() => setConfirmCancel(null)}
            onConfirm={confirmCancelWorkout}
            confirmText="כן"
            cancelText="ביטול"
          />
        )}

        {message && (
          <MessageModal
            message={message}
            type={message.includes("שגיאה") ? "error" : "info"}
            onClose={() => setMessage("")}
          />
        )}

        <img
          src={calisthenicsImg}
          alt="Calisthenics_pic"
          className={classes.pic}
        />
      </main>

      <Footer />
    </div>
  );
}
