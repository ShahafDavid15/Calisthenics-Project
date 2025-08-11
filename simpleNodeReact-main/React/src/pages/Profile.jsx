import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import MessageModal from "../components/messagemodal/MessageModal";
import classes from "./profile.module.css";

export default function Profile({ onLogout }) {
  // State variables for user profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [username, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  // State variables for modal message display
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");
  const [showModal, setShowModal] = useState(false);

  // State variables for password change form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          const dbDate = new Date(data.birth_date);
          const year = dbDate.getFullYear();
          const month = (dbDate.getMonth() + 1).toString().padStart(2, "0");
          const day = dbDate.getDate().toString().padStart(2, "0");
          setBirthDate(`${year}-${month}-${day}`);
        } else {
          setBirthDate("");
        }

        setGender(data.gender || "");
        setUserName(storedUsername);
        setLoading(false);
      } catch (err) {
        showError(`Error loading profile: ${err.message}`);
        setLoading(false);
      }
    };

    if (storedUsername && storedUserId) {
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
        method: "PUT",
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

  const validatePassword = (password) => {
    const lengthValid = password.length >= 8 && password.length <= 16;
    const hasLetter = /[a-zA-Zא-ת]/.test(password);
    const hasDigit = /\d/.test(password);
    return lengthValid && hasLetter && hasDigit;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      showError("הסיסמה חייבת להכיל 8-16 תווים, לפחות אות אחת וספרה אחת");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showError("הסיסמה החדשה ואישור הסיסמה אינם תואמים.");
      return;
    }

    try {
      const response = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          currentPassword: oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("הסיסמה עודכנה בהצלחה!");
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setShowPasswordChangeForm(false);
      } else {
        showError(`שגיאה בשינוי הסיסמה: ${data.error || "לא ידוע"}`);
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
      <button onClick={onLogout} className={classes.logoutButton}>
        התנתקות
      </button>

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

      <hr className={classes.divider} />

      {showPasswordChangeForm ? (
        <form onSubmit={handleChangePassword} className={classes.form}>
          <div className={classes.inputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="סיסמה ישנה"
              className={classes.input}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className={classes.inputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="סיסמה חדשה"
              className={classes.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className={classes.inputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="אישור סיסמה חדשה"
              className={classes.input}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          <div className={classes.showPasswordContainer}>
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <label htmlFor="showPassword">הצג סיסמה</label>
          </div>
          <div className={classes.buttonGroup}>
            <button
              type="button"
              className={classes.cancelButton}
              onClick={() => {
                setShowPasswordChangeForm(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
              }}
            >
              בטל
            </button>
            <button type="submit" className={classes.button}>
              עדכן סיסמה
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowPasswordChangeForm(true)}
          className={classes.button}
        >
          שינוי סיסמה
        </button>
      )}

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
