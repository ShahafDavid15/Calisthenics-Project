import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import { Link } from "react-router-dom";
import classes from "./home.module.css";
import calisthenicsImg from "../images/Calisthenics.jpeg";
import React from "react";

export default function Home({ onLogout }) {
  return (
    <div className={classes.container}>
      <Header />
      <NavBar />

      <button onClick={onLogout} className={classes.logoutButton}>
        התנתקות
      </button>

      <main className={classes.main}>
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

        <div className={classes.text}>
          !ברוכים הבאים לאתר אימוני הקליסטניקס
          <br />
          כאן תוכלו ללמוד איך לשלוט בגוף שלכם ברמה הגבוהה ביותר ולהגיע לתוצאות
          שלא חלמתם עליהן
          <br />
          .תוכלו לבחור את המסלול המתאים עבורכם בקטגוריית רכישת מנוי
        </div>

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
