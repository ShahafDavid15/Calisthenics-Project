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

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ForgotUsername from "./pages/ForgotUsername"; // <-- ייבוא הקומפוננטה החדשה

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  const handleLogout = () => setUser(null);

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          {user ? <Redirect to="/home" /> : <Login setUser={setUser} />}
        </Route>

        <Route path="/signup">
          <Login setUser={setUser} />
        </Route>

        <Route path="/forgot-password">
          <ForgotPassword />
        </Route>

        <Route path="/forgot-username">
          <ForgotUsername /> {/* <-- Route חדש */}
        </Route>

        {/* Query param route */}
        <Route path="/reset-password">
          <ResetPassword />
        </Route>

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
      </Switch>
    </Router>
  );
}

export default App;
