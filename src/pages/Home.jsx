import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import { Link } from "react-router-dom";
import classes from "./home.module.css";
import calisthenicsImg from "../images/Calisthenics.jpeg";

export default function Home() {
  return (
    <div className={classes.container}>
      <Header />
      <NavBar />

      {/* כפתור התנתקות */}
      <Link to="/login" className={classes.logoutButton}>
        התנתקות
      </Link>

      <main className={classes.main}>
        <div className={classes.text}>
          ברוכים הבאים לאתר אימוני הקליסטניקס!
          <br />
          כאן תוכלו ללמוד איך לשלוט בגוף שלכם ברמה הגבוהה ביותר ולהגיע לתוצאות
          שלא חלמתם עליהן.
          <br />
          תוכלו לבחור את המסלול המתאים עבורכם בקטגוריית רכישת מנוי.
        </div>

        <ul className={classes.linkList}>
          <li className={classes.linkItem}>
            <Link to="/profile" className={classes.link}>
              פרטים אישיים
            </Link>
          </li>
          <li className={classes.linkItem}>
            <Link to="/membership" className={classes.link}>
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
