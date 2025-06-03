import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./profile.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Profile({ onLogout }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (firstName && lastName && phone && email && birthDate && gender) {
      const userDetails = {
        firstName,
        lastName,
        phone,
        email,
        birthDate,
        gender,
      };
      console.log("פרטים שהוזנו:", userDetails);
      alert("הפרטים נשמרו בהצלחה!");
    } else {
      alert("אנא מלא את כל השדות");
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

        <h2 className={classes.title}>פרטים אישיים</h2>

        <form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.inputContainer}>
            <input
              type="text"
              placeholder="שם פרטי"
              className={classes.input}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className={classes.inputContainer}>
            <input
              type="text"
              placeholder="שם משפחה"
              className={classes.input}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className={classes.inputContainer}>
            <input
              type="tel"
              placeholder="מספר טלפון"
              className={classes.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className={classes.inputContainer}>
            <input
              type="email"
              placeholder="דואר אלקטרוני"
              className={classes.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={classes.inputContainer}>
            <input
              type="date"
              className={classes.input}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div className={classes.inputContainer}>
            <select
              className={classes.input}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">בחר מגדר</option>
              <option value="זכר">זכר</option>
              <option value="נקבה">נקבה</option>
              <option value="אחר">אחר</option>
            </select>
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
