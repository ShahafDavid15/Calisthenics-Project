// src/pages/ResetPassword.jsx
import React, { useState } from "react";
// useLocation to access URL query params, useHistory to navigate after success
import { useLocation, useHistory } from "react-router-dom";
import classes from "./resetpassword.module.css";

export default function ResetPassword() {
  // State variables for new password input, confirmation, error message, and success message
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // React Router hooks for accessing URL and navigation
  const history = useHistory();
  const location = useLocation();

  // Extract the 'token' query parameter from URL (e.g. ?token=abc123)
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  // Handler for the reset password form submission
  const handleSubmit = async () => {
    // Basic validation: check if passwords match before sending request
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Send POST request to backend endpoint to reset password
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the token and new password in the request body as JSON
        body: JSON.stringify({ token, newPassword }),
      });

      // Parse JSON response
      const data = await res.json();

      if (!res.ok) {
        // If HTTP response not OK, display error message from server or default
        setError(data.error || "Reset failed.");
      } else {
        // On success, show success message
        setMessage("Password reset successfully!");
        // Redirect user to homepage after 3 seconds
        setTimeout(() => history.push("/"), 3000);
      }
    } catch {
      // Handle network or other unexpected errors
      setError("Connection error.");
    }
  };

  return (
    <div className={classes.container}>
      <h2>Reset Password</h2>

      {/* Input for new password */}
      <input
        type="password"
        placeholder="New Password"
        className={classes.input}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      {/* Input to confirm new password */}
      <input
        type="password"
        placeholder="Confirm Password"
        className={classes.input}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {/* Button to submit the password reset request */}
      <button className={classes.button} onClick={handleSubmit}>
        Reset Password
      </button>

      {/* Display success message if available */}
      {message && <p className={classes.success}>{message}</p>}

      {/* Display error message if available */}
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
}
