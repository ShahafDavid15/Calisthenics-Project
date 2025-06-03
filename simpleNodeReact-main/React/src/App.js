import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Membership from "./pages/Membership";
import Workout from "./pages/Workout";
import WorkoutDetails from "./pages/WorkoutDetails";

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/home" /> : <Login setUser={setUser} />}
        />
        <Route path="/signup" element={<Login setUser={setUser} />} />
        <Route
          path="/home"
          element={
            user ? <Home onLogout={handleLogout} /> : <Navigate to="/" />
          }
        />
        <Route
          path="/profile"
          element={
            user ? <Profile onLogout={handleLogout} /> : <Navigate to="/" />
          }
        />
        <Route
          path="/membership"
          element={
            user ? <Membership onLogout={handleLogout} /> : <Navigate to="/" />
          }
        />

        <Route
          path="/workout"
          element={
            user ? <Workout onLogout={handleLogout} /> : <Navigate to="/" />
          }
        />

        <Route
          path="/workoutdetails"
          element={
            user ? (
              <WorkoutDetails onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
