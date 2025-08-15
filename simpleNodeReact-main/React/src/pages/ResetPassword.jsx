import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import classes from "./resetpassword.module.css";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();
  const history = useHistory();

  // קבלת token מה-query param
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  if (!token) {
    return (
      <div className={classes.container}>
        <h2>Invalid or missing token</h2>
        <p>Please use the link from your email to reset your password.</p>
      </div>
    );
  }

  const validatePassword = (password) => {
    const lengthValid = password.length >= 8 && password.length <= 16;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    return lengthValid && hasLetter && hasDigit;
  };

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be 8-16 characters long and contain at least one letter and one number."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Password reset failed.");
      } else {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => history.push("/"), 3000);
      }
    } catch {
      setError("Connection error.");
    }
  };

  return (
    <div className={classes.container}>
      <h2>Reset Password</h2>

      <input
        type={showPassword ? "text" : "password"}
        placeholder="New Password"
        className={classes.input}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <input
        type={showPassword ? "text" : "password"}
        placeholder="Confirm Password"
        className={classes.input}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <label className={classes.showPassword}>
        <input
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
        />{" "}
        Show Password
      </label>

      <button className={classes.button} onClick={handleSubmit}>
        Reset Password
      </button>

      {message && <p className={classes.success}>{message}</p>}
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
}
