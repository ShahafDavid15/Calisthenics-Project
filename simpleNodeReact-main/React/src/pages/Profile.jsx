import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import MessageModal from "../components/messagemodal/MessageModal";
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

  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedUsername = Cookies.get("username");
    const storedUserId = Cookies.get("user_id");

    const fetchUserProfile = async (id) => {
      try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user profile");
        }
        const data = await response.json();

        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");

        if (data.birth_date) {
          const dateParts = data.birth_date.slice(0, 10).split("-");
          const localDate = new Date(
            dateParts[0],
            dateParts[1] - 1,
            dateParts[2]
          );
          const year = localDate.getFullYear();
          const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
          const day = localDate.getDate().toString().padStart(2, "0");
          setBirthDate(`${year}-${month}-${day}`);
        } else {
          setBirthDate("");
        }

        setGender(data.gender || "");
        setLoading(false);
      } catch (err) {
        showError(`Error loading profile: ${err.message}`);
        setLoading(false);
      }
    };

    if (storedUsername && storedUserId) {
      setUserName(storedUsername);
      fetchUserProfile(storedUserId);
    } else {
      showError("User not logged in or user data missing. Please log in.");
      setLoading(false);
    }
  }, []);

  const showError = (msg) => {
    setModalType("error");
    setModalMessage(msg);
    setShowModal(true);
  };

  const showSuccess = (msg) => {
    setModalType("success");
    setModalMessage(msg);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    const userDetails = {
      username,
      firstName,
      lastName,
      phone,
      email,
      birthDate: birthDate || null,
      gender,
    };

    try {
      const response = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDetails),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("הפרטים נשמרו בהצלחה!");
      } else {
        showError(`שגיאה בשמירת הפרטים: ${data.error || "לא ידוע"}`);
      }
    } catch (error) {
      showError(`שגיאה בחיבור: ${error.message}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !phone || !email || !birthDate || !gender) {
      showError("אנא מלא את כל השדות.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showError("מספר טלפון חייב להכיל 10 ספרות בדיוק.");
      return;
    }

    if ((email.match(/@/g) || []).length !== 1) {
      showError("כתובת אימייל חייבת להכיל בדיוק סימן '@' אחד.");
      return;
    }

    handleUpdate();
  };

  if (loading) {
    return (
      <div className={classes.container}>
        <Header />
        <NavBar />
        <main className={classes.main}>
          <p>טוען פרטי משתמש...</p>
        </main>
        <Footer />
      </div>
    );
  }

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

        <form onSubmit={handleSubmit} className={classes.form} noValidate>
          <div className={classes.inputContainer}>
            <input
              type="text"
              placeholder="שם פרטי"
              className={classes.input}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className={classes.inputContainer}>
            <input
              type="text"
              placeholder="שם משפחה"
              className={classes.input}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className={classes.inputContainer}>
            <input
              type="tel"
              placeholder="מספר טלפון"
              className={classes.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className={classes.inputContainer}>
            <input
              type="email"
              placeholder="דואר אלקטרוני"
              className={classes.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={classes.inputContainer}>
            <input
              type="date"
              className={classes.input}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div className={classes.inputContainer}>
            <select
              className={classes.input}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
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

      {showModal && (
        <MessageModal
          type={modalType}
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}

      <Footer className={classes.footer} />
    </div>
  );
}
