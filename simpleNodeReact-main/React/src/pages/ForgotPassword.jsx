import React, { useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { Link } from "react-router-dom";
import classes from "./forgotpassword.module.css";

export default function ForgotPassword() {
  // State to store user email input
  const [email, setEmail] = useState("");
  // State to show success message
  const [message, setMessage] = useState("");
  // State to show error message
  const [error, setError] = useState("");

  // Handle click on "Send Password Reset Email" button
  const handleSubmit = async () => {
    // Reset previous messages
    setError("");
    setMessage("");

    // Basic validation: check if email is entered
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      // Send POST request to backend to trigger password reset email
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      // Check for backend errors
      if (!res.ok) {
        setError(data.error || "Failed to send reset email.");
      } else {
        // Show success message to user
        setMessage(
          "Check your email for the password reset link. The link is valid for 15 minutes."
        );
      }
    } catch {
      // Handle network/connection errors
      setError("Connection error. Try again.");
    }
  };

  return (
    <div className={classes.pageWrapper}>
      <Header />

      {/* Link to navigate back to login page */}
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

        {/* Submit button */}
        <button className={classes.button} onClick={handleSubmit}>
          Send Password Reset Email
        </button>

        {/* Display messages */}
        {message && <p className={classes.success}>{message}</p>}
        {error && <p className={classes.error}>{error}</p>}
      </main>

      <Footer />
    </div>
  );
}
