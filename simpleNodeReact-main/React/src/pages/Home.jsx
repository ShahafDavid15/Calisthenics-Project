import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./home.module.css";
import calisthenicsImg from "../images/Calisthenics.jpeg";

/**
 * Home component
 * Displays the homepage with navigation links and a welcome message.
 * @param {function} onLogout - Function to handle user logout
 * @param {object} currentUser - The logged-in user object
 * @returns JSX for the Home screen
 */
export default function Home({ onLogout, currentUser }) {
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserWorkouts = async () => {
      try {
        const res = await fetch(
          `http://localhost:3002/api/user-workouts?user_id=${currentUser?.id}`
        );
        const data = await res.json();
        setUserWorkouts(data);
      } catch {
        setUserWorkouts([]);
      }
    };

    if (currentUser?.id) {
      fetchUserWorkouts();
    }
  }, [currentUser]);

  const handleCancel = async (workoutId) => {
    if (!window.confirm("בטוח שברצונך לבטל את האימון?")) return;

    try {
      const res = await fetch(
        `http://localhost:3002/api/user-workouts/${workoutId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Delete failed");
      setUserWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
      setMessage("האימון בוטל בהצלחה.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("שגיאה בביטול האימון.");
    }
  };

  return (
    <div className={classes.container}>
      {/* Top header */}
      <Header />

      {/* Navigation bar */}
      <NavBar />

      {/* Logout button */}
      <button onClick={onLogout} className={classes.logoutButton}>
        התנתקות
      </button>

      <main className={classes.main}>
        {/* Navigation links */}
        <ul className={classes.linkList}>
          <li className={classes.linkItem}>
            <Link to="/profile" className={classes.link}>
              פרטים אישיים
            </Link>
          </li>
          <li className={classes.linkItem}>
            <Link to="/membership" className={classes.link}>
              ניהול מנויים
            </Link>
          </li>
          <li className={classes.linkItem}>
            <Link to="/purchase-membership" className={classes.link}>
              רכישת מנוי
            </Link>
          </li>
          <li className={classes.linkItem}>
            <Link to="/workout" className={classes.link}>
              הזמנת אימון
            </Link>
          </li>
          <li className={classes.linkItem}>
            <Link to="/workoutdetails" className={classes.link}>
              נתוני אימון
            </Link>
          </li>
        </ul>

        {/* Welcome text */}
        <div className={classes.text}>
          !ברוכים הבאים לאתר אימוני הקליסטניקס
          <br />
          כאן תוכלו ללמוד איך לשלוט בגוף שלכם ברמה הגבוהה ביותר ולהגיע לתוצאות
          שלא חלמתם עליהן
          <br />
          .תוכלו לבחור את המסלול המתאים עבורכם בקטגוריית רכישת מנוי
        </div>

        {/* User workouts list */}
        {userWorkouts.length > 0 && (
          <div className={classes.userWorkouts}>
            <h3>האימונים שלך:</h3>
            <ul className={classes.workoutList}>
              {userWorkouts.map((w) => (
                <li key={w.id} className={classes.workoutItem}>
                  אימון בתאריך {w.workout_date} בשעה {w.workout_time}
                  <button
                    onClick={() => handleCancel(w.id)}
                    className={classes.cancelButton}
                    type="button"
                  >
                    ביטול
                  </button>
                </li>
              ))}
            </ul>
            {message && <p className={classes.message}>{message}</p>}
          </div>
        )}

        {/* Calisthenics image */}
        <img
          src={calisthenicsImg}
          alt="Calisthenics_pic"
          className={classes.pic}
        />
      </main>

      {/* Footer section */}
      <Footer />
    </div>
  );
}
