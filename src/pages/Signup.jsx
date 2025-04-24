import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import { useState } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    if (name && email && password) {
      alert("נרשמת בהצלחה!");
    } else {
      alert("אנא מלא את כל השדות");
    }
  };

  return (
    <div className={classes.page}>
      <Header />
      <NavBar />
      <main className={classes.main}>
        <h1 className={classes.title}>יצירת חשבון</h1>
        <input
          placeholder="שם מלא"
          className={classes.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="אימייל"
          className={classes.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="סיסמה"
          className={classes.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className={classes.button} onClick={handleSignup}>
          צור חשבון
        </button>
      </main>
      <Footer />
    </div>
  );
}
