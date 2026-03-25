/**
 * Login page
 * Handles user login and registration forms.
 * Props:
 * setUser: callback to update the login user state
 * Uses Header, Footer, NavBar components.
 * Validates input and communicates with backend endpoints.
 */

import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./login.module.css";
import Cookies from "js-cookie";

export default function Login({ setUser }) {
  // State for form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for displaying error messages
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  // Toggle to show/hide password
  const [showPassword, setShowPassword] = useState(false);

  const history = useHistory();
  const location = useLocation();

  // Determine if the current page is the registration page
  const isRegistration = location.pathname === "/signup";

  // Reset form when switching between login and signup
  useEffect(() => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowError(false);
    setShowPassword(false);
  }, [isRegistration]);

  // Show message if session expired (redirected from 401)
  useEffect(() => {
    if (sessionStorage.getItem("session_expired")) {
      sessionStorage.removeItem("session_expired");
      setError("פג תוקף ההתחברות. אנא התחבר מחדש.");
      setShowError(true);
    }
  }, []);

  // Form validation
  const validateForm = () => {
    setError("");

    // Validate username: at least 2 letters/numbers
    if (!username || !/^[A-Za-z0-9]{2,}$/.test(username)) {
      setError("Username must contain at least 2 letters.");
      return false;
    }

    // Validate password: 8-16 characters, at least one letter and one number
    if (
      !password ||
      !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(password)
    ) {
      setError(
        "Password must be 8-16 characters long and contain at least one letter and one number."
      );
      return false;
    }

    // Additional check for registration: passwords must match
    if (isRegistration && password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  // Handle login form submission
  const handleLogin = async () => {
    if (!validateForm()) {
      setShowError(true);
      return;
    }

    try {
      // Send login request to backend
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      // Handle server errors
      if (!response.ok) {
        setError(data.error || "Login failed. Please try again.");
        setShowError(true);
        return;
      }

      // Successful login - save token and user
      if (data.token) {
        sessionStorage.setItem("token", data.token);
      }
      setUser({ name: data.username, id: data.user_id, role: data.role });
      Cookies.set("username", data.username);
      Cookies.set("user_id", data.user_id);

      // Navigate to home page
      history.push("/home");
    } catch (err) {
      // Handle network errors
      setError("Connection error. Please check the server.");
      setShowError(true);
    }
  };

  // Handle registration form submission
  const handleRegistration = async () => {
    if (!validateForm()) {
      setShowError(true);
      return;
    }

    try {
      // Send registration request to backend
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      // Handle server errors or username conflicts
      if (!response.ok) {
        if (response.status === 409) {
          setError("Username already exists. Please choose another.");
        } else {
          setError(data.error || "Registration failed. Please try again.");
        }
        setShowError(true);
        return;
      }

      // Successful registration: navigate to login page
      history.push("/");
    } catch (err) {
      setError("Connection error. Please check the server.");
      setShowError(true);
    }
  };

  // Close error modal
  const closeErrorModal = () => {
    setShowError(false);
  };

  // Choose the correct submit handler based on page type
  const handleSubmit = isRegistration ? handleRegistration : handleLogin;

  // Show NavBar only on non-login/non-signup pages
  const showNavBar = !(
    location.pathname === "/" || location.pathname === "/signup"
  );

  return (
    <div className={classes.pageWrapper}>
      <Header />
      {showNavBar && <NavBar currentUser={null} />}

      <main className={classes.main}>
        <div className={classes.card}>
          <h2 className={classes.title}>
            {isRegistration ? "Register" : "Login"}
          </h2>

          {/* Username input */}
          <div className={classes.inputContainer}>
            <input
              id="username"
              type="text"
              placeholder="Username"
              className={classes.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password input */}
          <div className={classes.inputContainer}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={classes.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm password input (registration only) */}
          {isRegistration && (
            <div className={classes.inputContainer}>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className={classes.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {/* Show/hide password toggle */}
          <div className={classes.inputContainer}>
            <label className={classes.checkboxLabel}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              Show Password
            </label>
          </div>

          {/* Submit button */}
          <button className={classes.button} onClick={handleSubmit}>
            {isRegistration ? "Register" : "Login"}
          </button>

          <hr className={classes.divider} />

          {/* Links group */}
          <div className={classes.linksGroup}>
            <Link to={isRegistration ? "/" : "/signup"} className={classes.link}>
              {isRegistration
                ? "Already have an account? Login"
                : "Don't have an account? Create one"}
            </Link>

            {!isRegistration && (
              <>
                <Link to="/forgot-password" className={classes.link}>
                  Forgot your password?
                </Link>
                <Link to="/forgot-username" className={classes.link}>
                  Forgot your username?
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Error modal */}
      {showError && (
        <div className={classes.errorModel}>
          <div className={classes.errorContent}>
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={closeErrorModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
