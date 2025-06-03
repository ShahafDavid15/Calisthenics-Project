import { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./login.module.css";
import Cookies from "js-cookie";
import React from "react";


export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const history = useHistory();
  const location = useLocation();

  const isRegistration = location.pathname === "/signup";

  useEffect(() => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowError(false);
  }, [isRegistration]);

  const validateForm = () => {
    setError("");

    if (!username || !/^[A-Za-z]{2,}$/.test(username)) {
      setError("Username must contain at least 2 letters");
      return false;
    }

    if (
      !password ||
      !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/.test(password)
    ) {
      setError(
        "Password must be 3-8 characters long, and contain at least one letter and one number."
      );
      return false;
    }

    if (isRegistration && password !== confirmPassword) {
      setError("Passwords do not match");
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

      setUser({ name: data.username, id: data.user_id });
      Cookies.set("username", data.username);
      history.push("/home");
    } catch (err) {
      setError("Connection error. Please check the connection to the server.");
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

      history.push("/");
    } catch (err) {
      setError("Connection error. Please check the connection to the server.");
      setShowError(true);
    }
  };

  const closeErrorModel = () => {
    setShowError(false);
  };

  const handleSubmit = isRegistration ? handleRegistration : handleLogin;

  return (
    <div className={classes.container}>
      <Header />
      <NavBar />
      <main className={classes.main}>
        <h2 className={classes.title}>
          {isRegistration ? "Register" : "Login"}
        </h2>

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
