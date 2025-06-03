import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Membership from "./pages/Membership";
import Workout from "./pages/Workout";
import WorkoutDetails from "./pages/WorkoutDetails";
import React from "react";


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

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          {user ? <Redirect to="/home" /> : <Login setUser={setUser} />}
        </Route>
        <Route path="/signup">
          <Login setUser={setUser} />
        </Route>
        <Route path="/home">
          {user ? <Home onLogout={handleLogout} /> : <Redirect to="/" />}
        </Route>
        <Route path="/profile">
          {user ? <Profile onLogout={handleLogout} /> : <Redirect to="/" />}
        </Route>
        <Route path="/membership">
          {user ? <Membership onLogout={handleLogout} /> : <Redirect to="/" />}
        </Route>
        <Route path="/workout">
          {user ? <Workout onLogout={handleLogout} /> : <Redirect to="/" />}
        </Route>
        <Route path="/workoutdetails">
          {user ? (
            <WorkoutDetails onLogout={handleLogout} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
