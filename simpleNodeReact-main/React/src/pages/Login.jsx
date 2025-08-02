import { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./login.module.css";
import Cookies from "js-cookie";
import React from "react";

/**
 * Login component
 * Handles both login and registration logic, based on current route (/ or /signup)
 * @param {function} setUser - Sets the logged-in user in parent component
 */
export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Only used during registration
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  const history = useHistory();
  const location = useLocation();

  // Determine if user is on the registration page
  const isRegistration = location.pathname === "/signup";

  // Reset form state when switching between login and signup
  useEffect(() => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowError(false);
  }, [isRegistration]);

  // Validate the form input
  const validateForm = () => {
    setError("");

    // Check username validity (only letters, min 2 chars)
    if (!username || !/^[A-Za-z]{2,}$/.test(username)) {
      setError("Username must contain at least 2 letters");
      return false;
    }

    // Check password validity (3-8 chars, at least 1 letter and 1 number)
    if (
      !password ||
      !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/.test(password)
    ) {
      setError(
        "Password must be 3-8 characters long, and contain at least one letter and one number."
      );
      return false;
    }

    // In registration: check if passwords match
    if (isRegistration && password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  // Handle login logic
  const handleLogin = async () => {
    if (!validateForm()) {
      setShowError(true);
      return;
    }

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error, try again");
        setShowError(true);
        return;
      }

      // On success: set user state and cookies, navigate to home
      setUser({ name: data.username, id: data.user_id });
      Cookies.set("username", data.username);
      Cookies.set("user_id", data.user_id);
      history.push("/home");
    } catch (err) {
      setError("Connection error. Please check the connection to the server.");
      setShowError(true);
    }
  };

  // Handle registration logic
  const handleRegistration = async () => {
    if (!validateForm()) {
      setShowError(true);
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError("Username already exists. Please choose another one.");
        } else {
          setError(data.error || "Registration failed. Please try again.");
        }
        setShowError(true);
        return;
      }

      // On success: redirect to login page
      history.push("/");
    } catch (err) {
      setError("Connection error. Please check the connection to the server.");
      setShowError(true);
    }
  };

  // Close the error modal
  const closeErrorModel = () => {
    setShowError(false);
  };

  // Choose handler based on current mode
  const handleSubmit = isRegistration ? handleRegistration : handleLogin;

  return (
    <div className={classes.container}>
      <Header />
      <NavBar />
      <main className={classes.main}>
        {/* Title changes depending on login or registration */}
        <h2 className={classes.title}>
          {isRegistration ? "Register" : "Login"}
        </h2>

        {/* Username input */}
        <div className={classes.inputContainer}>
          <input
            id="username"
            type="text"
            placeholder="username"
            className={classes.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Password input */}
        <div className={classes.inputContainer}>
          <input
            id="password"
            type="password"
            placeholder="password"
            className={classes.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Confirm password input (only for registration) */}
        {isRegistration && (
          <div className={classes.inputContainer}>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              className={classes.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        )}

        {/* Submit button */}
        <button className={classes.button} onClick={handleSubmit}>
          {isRegistration ? "Register" : "Login"}
        </button>

        {/* Link to switch between login and register */}
        <p>
          <Link to={isRegistration ? "/" : "/signup"} className={classes.link}>
            {isRegistration
              ? "Already have an account? Login"
              : "Don't have an account? Create one"}
          </Link>
        </p>

        {/* Error modal */}
        {showError && (
          <div className={classes.errorModel}>
            <div className={classes.errorContent}>
              <h3>Error</h3>
              <p>{error}</p>
              <button onClick={closeErrorModel}>close</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
