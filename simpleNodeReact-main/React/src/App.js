import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Membership from "./pages/Membership";
import Workout from "./pages/Workout";
import WorkoutDetails from "./pages/WorkoutDetails";
import PurchaseMembership from "./pages/PurchaseMembership";

// Newly added pages for password recovery
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  // Initialize user state from sessionStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Sync user state changes to sessionStorage to persist login across refreshes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  // Logout handler clears user state
  const handleLogout = () => {
    setUser(null);
  };

  return (
    // Router wraps the app to handle client-side routing
    <Router>
      <Switch>
        {/* Root path: redirect logged-in users to /home, else show Login */}
        <Route exact path="/">
          {user ? <Redirect to="/home" /> : <Login setUser={setUser} />}
        </Route>

        {/* Signup page uses the same Login component */}
        <Route path="/signup">
          <Login setUser={setUser} />
        </Route>

        {/* Forgot Password page */}
        <Route path="/forgot-password">
          <ForgotPassword />
        </Route>

        {/* Reset Password page */}
        <Route path="/reset-password">
          <ResetPassword />
        </Route>

        {/* Home page, protected route: only accessible if logged in */}
        <Route path="/home">
          {user ? (
            <Home onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>

        {/* Profile page, protected route */}
        <Route path="/profile">
          {user ? (
            <Profile onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>

        {/* Membership page, protected route */}
        <Route path="/membership">
          {user ? (
            <Membership onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>

        {/* Workout page, protected route */}
        <Route path="/workout">
          {user ? (
            <Workout onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>

        {/* Workout Details page, protected route */}
        <Route path="/workoutdetails">
          {user ? (
            <WorkoutDetails onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>

        {/* Purchase Membership page, protected route */}
        <Route path="/purchase-membership">
          {user ? (
            <PurchaseMembership onLogout={handleLogout} currentUser={user} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
