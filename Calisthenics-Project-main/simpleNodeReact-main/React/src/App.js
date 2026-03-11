/**
 * Main React application component.
 * Sets up routing for all pages and handles user session.
 * Protects routes for logged-in users and admin-only pages.
 */

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";

// Import pages/components
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Membership from "./pages/Membership";
import Workout from "./pages/Workout";
import WorkoutDetails from "./pages/WorkoutDetails";
import PurchaseMembership from "./pages/PurchaseMembership";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ForgotUsername from "./pages/ForgotUsername";
import Members from "./pages/Members";

function App() {
  // State for storing logged-in user
  // Initializes user state from sessionStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Sync user state to sessionStorage
  // Updates sessionStorage whenever user state changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  // Logout handler - clears user, token and sessionStorage
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Router>
      <Switch>
        {/* Root route */}
        <Route exact path="/">
          {user ? <Redirect to="/home" /> : <Login setUser={setUser} />}
        </Route>

        {/* Signup route */}
        <Route path="/signup">
          <Login setUser={setUser} />
        </Route>

        {/* Forgot password */}
        <Route path="/forgot-password">
          <ForgotPassword />
        </Route>

        {/* Forgot username */}
        <Route path="/forgot-username">
          <ForgotUsername />
        </Route>

        {/* Reset password */}
        <Route path="/reset-password">
          <ResetPassword />
        </Route>

        {/* Protected pages: redirect to login if no user */}
        <Route path="/home">
          {user ? (
            <Home onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>

        <Route path="/profile">
          {user ? (
            <Profile onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>

        <Route path="/membership">
          {user ? (
            <Membership onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>

        <Route path="/workout">
          {user ? (
            <Workout onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>

        <Route path="/workoutdetails">
          {user ? (
            <WorkoutDetails onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>

        <Route path="/purchase-membership">
          {user ? (
            <PurchaseMembership onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>

        {/* --- Admin-only page --- */}
        <Route path="/members">
          {user && (user.name === "admin" || user.role === "admin") ? (
            <Members onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
