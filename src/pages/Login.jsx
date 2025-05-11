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
    <div className={classes.container}>
      <Header />
      <NavBar />
      <main className={classes.main}>
        <h2 className={classes.title}>התחברות</h2>

        <div className={classes.inputContainer}>
          <input
            id="email"
            type="email"
            placeholder="אימייל"
            className={classes.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={classes.inputContainer}>
          <input
            id="password"
            type="password"
            placeholder="סיסמה"
            className={classes.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className={classes.button} onClick={handleLogin}>
          התחבר
        </button>

        <p>
          <Link to="/signup" className={classes.link}>
            אין לך חשבון? צור אחד
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
