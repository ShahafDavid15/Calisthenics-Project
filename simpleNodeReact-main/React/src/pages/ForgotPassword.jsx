import React, { useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { Link } from "react-router-dom";
import classes from "./forgotpassword.module.css";

// ForgotPassword component allows users to request a password reset email
export default function ForgotPassword() {
  // State for email input
  const [email, setEmail] = useState("");
  // State for success message
  const [message, setMessage] = useState("");
  // State for error message
  const [error, setError] = useState("");

  // Handle the form submission
  const handleSubmit = async () => {
    try {
      // Send a POST request to the forgot-password API
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      // Handle server response
      if (!res.ok) {
        // If server returned an error, display it
        setError(data.error || "Failed to send reset email.");
        setMessage(""); // Clear success message
      } else {
        // If successful, show confirmation message
        setMessage("Check your email for the password reset link.");
        setError(""); // Clear error message
      }
    } catch {
      // Handle network or unexpected errors
      setError("Connection error. Try again.");
      setMessage("");
    }
  };

  return (
    <div className={classes.pageWrapper}>
      <Header />

      {/* Link back to the login page */}
      <Link to="/" className={classes.link}>
        Back to Login
      </Link>

      <main className={classes.container}>
        <h2>Forgot Password</h2>

        {/* Email input field */}
        <input
          type="email"
          placeholder="Enter your email"
          className={classes.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Submit button to send reset email */}
        <button className={classes.button} onClick={handleSubmit}>
          Send Reset Email
        </button>

        {/* Show success message */}
        {message && <p className={classes.success}>{message}</p>}

        {/* Show error message */}
        {error && <p className={classes.error}>{error}</p>}
      </main>

      <Footer />
    </div>
  );
}
