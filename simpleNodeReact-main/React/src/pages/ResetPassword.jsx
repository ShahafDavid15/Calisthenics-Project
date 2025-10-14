/**
 * ResetPassword.jsx
 * This page allows a user to reset their password using a token received by email.
 * The user enters a new password, confirms it, and submits.
 * The form validates the password strength and checks that both inputs match.
 * On success, the user is redirected back to the login page.
 */

import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import classes from "./resetpassword.module.css";

export default function ResetPassword() {
  // State variables for password inputs and feedback messages
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Access query parameters and navigation
  const location = useLocation();
  const history = useHistory();

  // Extract token from query parameter
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  // If no token is present show error message
  if (!token) {
    return (
      <div className={classes.container}>
        <h2>Invalid or missing token</h2>
        <p>Please use the link from your email to reset your password.</p>
      </div>
    );
  }

  // Password validation helper
  const validatePassword = (password) => {
    const lengthValid = password.length >= 8 && password.length <= 16;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    return lengthValid && hasLetter && hasDigit;
  };

  // Handle password reset submission
  const handleSubmit = async () => {
    setError("");
    setMessage("");

    // Validate new password
    if (!validatePassword(newPassword)) {
      setError(
        "Password must be 8-16 characters long and contain at least one letter and one number."
      );
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Send POST request to reset password
    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Display error returned by server
        setError(data.error || "Password reset failed.");
      } else {
        // Success message and redirect to login after 3 seconds
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => history.push("/"), 3000);
      }
    } catch {
      setError("Connection error.");
    }
  };

  // Render the password reset form
  return (
    <div className={classes.container}>
      <h2>Reset Password</h2>

      {/* New password input */}
      <input
        type={showPassword ? "text" : "password"}
        placeholder="New Password"
        className={classes.input}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      {/* Confirm password input */}
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Confirm Password"
        className={classes.input}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {/* Checkbox to toggle password visibility */}
      <label className={classes.showPassword}>
        <input
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
        />{" "}
        Show Password
      </label>

      {/* Submit button */}
      <button className={classes.button} onClick={handleSubmit}>
        Reset Password
      </button>

      {/* Feedback messages */}
      {message && <p className={classes.success}>{message}</p>}
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
}
