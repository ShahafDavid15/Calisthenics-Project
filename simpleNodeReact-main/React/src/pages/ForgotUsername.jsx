import React, { useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { Link } from "react-router-dom";
import classes from "./forgotpassword.module.css";

export default function ForgotUsername() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      // שימוש ב-URL מלא כולל פורט של ה-backend
      const res = await fetch(
        "http://localhost:3002/api/users/forgot-username",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send username email.");
      } else {
        setMessage("Check your email. Your username has been sent.");
      }
    } catch {
      setError("Connection error. Try again.");
    }
  };

  return (
    <div className={classes.pageWrapper}>
      <Header />

      {/* Link back to login page */}
      <Link to="/" className={classes.link}>
        Back to Login
      </Link>

      <main className={classes.container}>
        <h2>Forgot Username</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className={classes.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className={classes.button} onClick={handleSubmit}>
          Send Username Email
        </button>

        {message && <p className={classes.success}>{message}</p>}
        {error && <p className={classes.error}>{error}</p>}
      </main>

      <Footer />
    </div>
  );
}
