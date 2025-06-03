import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./profile.module.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import React from "react";

export default function Profile({ onLogout }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [username, setUserName] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // נניח שאתה שומר את userId בקוקיז או צריך לקבל אותו בדרך כלשהי
    const username = Cookies.get("username");
    const user_id = Cookies.get("user_id"); // לדוגמה, צריך להוסיף בקוקיז את ה-user_id בכניסה
    setUserName(username);
    setUserId(user_id);

    // אם תרצה לטעון פרטים קיימים מהשרת בעת טעינת הדף:
    if (user_id) {
      fetch(`/user/${user_id}`) // צריך להוסיף בשרת API GET לפי user_id שיחזיר את הפרטים
        .then((res) => res.json())
        .then((data) => {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setBirthDate(data.birth_date ? data.birth_date.slice(0, 10) : "");
          setGender(data.gender || "");
        });
    }
  }, []);

  // פונקציה ששולחת את הפרטים לשרת לעדכון בטבלה users
  const handleUpdate = async () => {
    if (!username) {
      alert("משתמש לא מזוהה");
      return;
    }

    const userDetails = {
      username,
      firstName,
      lastName,
      phone,
      email,
      birthDate,
      gender,
    };
    console.log(userDetails);
    try {
      const response = await fetch("api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDetails),
      });

      const data = await response.json();

      if (response.ok) {
        alert("הפרטים נשמרו בהצלחה!");
      } else {
        alert("שגיאה בשמירת הפרטים: " + (data.error || "לא ידוע"));
      }
    } catch (error) {
      alert(error);
      console.error(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (firstName && lastName && phone && email && birthDate && gender) {
      handleUpdate();
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
