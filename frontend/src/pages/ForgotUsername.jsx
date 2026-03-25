/**
 * ForgotUsername.jsx
 * This page allows users who forgot their username to request it via email.
 * The user provides their registered email, the system sends a request to the backend,
 * and if the email exists, their username is sent to them via email.
 */

import React, { useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { Link } from "react-router-dom";
import classes from "./forgotpassword.module.css";

export default function ForgotUsername() {
  // State to store user email input
  const [email, setEmail] = useState("");
  // State to show success message
  const [message, setMessage] = useState("");
  // State to show error message
  const [error, setError] = useState("");

  // Handle click on Send Username Email button
  const handleSubmit = async () => {
    // Reset previous messages
    setError("");
    setMessage("");

    // Basic validation check if email is entered
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      // Send POST request to backend to send the username to the user's email
      // Using full URL with port for the backend
      const res = await fetch(
        "http://localhost:3002/api/users/forgot-username",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      // Check for backend errors
      if (!res.ok) {
        setError(data.error || "Failed to send username email.");
      } else {
        // Show success message
        setMessage("Check your email. Your username has been sent.");
      }
    } catch {
      // Handle network connection errors
      setError("Connection error. Try again.");
    }
  };

  return (
    <div className={classes.pageWrapper}>
      <Header />

      <main className={classes.main}>
        <div className={classes.container}>
          <h2 className={classes.title}>Forgot Username</h2>

          {/* Email input field */}
          <input
            type="email"
            placeholder="Enter your email"
            className={classes.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Submit button */}
          <button className={classes.button} onClick={handleSubmit}>
            Send Username Email
          </button>

          {/* Display messages */}
          {message && <p className={classes.success}>{message}</p>}
          {error && <p className={classes.error}>{error}</p>}

          {/* Link to navigate back to login page */}
          <p className={classes.redirectLink}>
            <Link to="/" className={classes.link}>Back to Login</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
