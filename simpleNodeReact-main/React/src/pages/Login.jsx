import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./login.module.css";
import Cookies from "js-cookie";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const history = useHistory();
  const location = useLocation();

  const isRegistration = location.pathname === "/signup";

  useEffect(() => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowError(false);
    setShowPassword(false);
  }, [isRegistration]);

  const validateForm = () => {
    setError("");
    if (!username || !/^[A-Za-z0-9]{2,}$/.test(username)) {
      setError("Username must contain at least 2 letters.");
      return false;
    }
    if (
      !password ||
      !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(password)
    ) {
      setError(
        "Password must be 8-16 characters long and contain at least one letter and one number."
      );
      return false;
    }
    if (isRegistration && password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      setShowError(true);
      return;
    }
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Login failed. Please try again.");
        setShowError(true);
        return;
      }
      setUser({ name: data.username, id: data.user_id });
      Cookies.set("username", data.username);
      Cookies.set("user_id", data.user_id);
      history.push("/home");
    } catch (err) {
      setError("Connection error. Please check the server.");
      setShowError(true);
    }
  };

  const handleRegistration = async () => {
    if (!validateForm()) {
      setShowError(true);
      return;
    }
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setError("Username already exists. Please choose another.");
        } else {
          setError(data.error || "Registration failed. Please try again.");
        }
        setShowError(true);
        return;
      }
      history.push("/");
    } catch (err) {
      setError("Connection error. Please check the server.");
      setShowError(true);
    }
  };

  const closeErrorModal = () => {
    setShowError(false);
  };

  const handleSubmit = isRegistration ? handleRegistration : handleLogin;

  const showNavBar = !(
    location.pathname === "/" || location.pathname === "/signup"
  );

  return (
    <div className={classes.container}>
      <Header />
      {showNavBar && <NavBar currentUser={null} />}
      <main className={classes.main}>
        <h2 className={classes.title}>
          {isRegistration ? "Register" : "Login"}
        </h2>

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

        <div className={classes.inputContainer}>
          <label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />{" "}
            Show Password
          </label>
        </div>

        <button className={classes.button} onClick={handleSubmit}>
          {isRegistration ? "Register" : "Login"}
        </button>

        <p>
          <Link to={isRegistration ? "/" : "/signup"} className={classes.link}>
            {isRegistration
              ? "Already have an account? Login"
              : "Don't have an account? Create one"}
          </Link>
        </p>

        {!isRegistration && (
          <>
            <p>
              <Link to="/forgot-password" className={classes.link}>
                Forgot your password?
              </Link>
            </p>
            <p>
              <Link to="/forgot-username" className={classes.link}>
                Forgot your username?
              </Link>
            </p>
          </>
        )}

        {showError && (
          <div className={classes.errorModel}>
            <div className={classes.errorContent}>
              <h3>Error</h3>
              <p>{error}</p>
              <button onClick={closeErrorModal}>Close</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
