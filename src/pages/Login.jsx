import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./login.module.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email && password) {
      setUser({ name: "משתמש", email });
      navigate("/home");
    } else {
      alert("אנא מלא את כל השדות");
    }
  };

  return (
    <div>
      <Header />
      <NavBar />
      <main className="main">
        <h2 className="title">התחברות</h2>
        <input
          type="email"
          placeholder="אימייל"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="סיסמה"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="button" onClick={handleLogin}>
          התחבר
        </button>
        <Link to="/signup" className="link">
          אין לך חשבון? צור אחד
        </Link>
      </main>
      <Footer />
    </div>
  );
}
