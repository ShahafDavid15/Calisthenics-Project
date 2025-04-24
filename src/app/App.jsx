import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Membership from "../pages/Membership";
import Workout from "../pages/Workout";
import WorkoutDetails from "../pages/WorkoutDetails";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/home" /> : <Login setUser={setUser} />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/workoutdetails" element={<WorkoutDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
