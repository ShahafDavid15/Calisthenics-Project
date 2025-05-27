import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./signup.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = () => {
    if (email && password && confirmPassword) {
      if (password === confirmPassword) {
        alert("נרשמת בהצלחה!");
      } else {
        alert("הסיסמה ואישור הסיסמה אינם תואמים");
      }
    } else {
      alert("אנא מלא את כל השדות");
    }
  };

  return (
    <div className={classes.container}>
      <Header />
      <NavBar />
      <main className={classes.main}>
        <h2 className={classes.title}>יצירת חשבון</h2>

        <div className={classes.inputContainer}>
          <input
            type="email"
            placeholder="אימייל"
            className={classes.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={classes.inputContainer}>
          <input
            type="password"
            placeholder="סיסמה"
            className={classes.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className={classes.inputContainer}>
          <input
            type="password"
            placeholder="אשר סיסמה"
            className={classes.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className={classes.button} onClick={handleSignup}>
          צור חשבון
        </button>

        <p className={classes.redirectLink}>
          <Link to="/" className={classes.link}>
            כבר יש לך חשבון? התחבר כאן
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
