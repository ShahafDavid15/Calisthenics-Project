import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./membership.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Subscription({ onLogout }) {
  const [selectedPlan, setSelectedPlan] = useState("");

  const plans = [
    { id: "basic", name: "Basic", price: 150, description: "כניסה אחת בשבוע" },
    {
      id: "standard",
      name: "Standard",
      price: 250,
      description: "שתי כניסות בשבוע",
    },
    {
      id: "premium",
      name: "Premium",
      price: 400,
      description: "שלוש כניסות בשבוע",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPlan) {
      alert("אנא בחר מנוי");
      return;
    }
    const chosenPlan = plans.find((plan) => plan.id === selectedPlan);
    alert(`בחרת במנוי: ${chosenPlan.name} בעלות ${chosenPlan.price} ₪ לחודש`);
    console.log("מנוי נבחר:", chosenPlan);
  };

  return (
    <div className={classes.container}>
      <Header />
      <NavBar />

      <button onClick={onLogout} className={classes.logoutButton}>
        התנתקות
      </button>

      <Link to="/home" className={classes.topLink}>
        חזור לדף הבית
      </Link>

      <main className={classes.main}>
        <h2 className={classes.title}>בחר מנוי לאימונים</h2>

        <form onSubmit={handleSubmit} className={classes.form}>
          {plans.map(({ id, name, price, description }) => (
            <label key={id} className={classes.planOption}>
              <input
                type="radio"
                name="subscriptionPlan"
                value={id}
                checked={selectedPlan === id}
                onChange={() => setSelectedPlan(id)}
              />
              <div className={classes.planDetails}>
                <h3>{name}</h3>
                <p>{description}</p>
                <p>מחיר: {price} ₪ לחודש</p>
              </div>
            </label>
          ))}
          <button type="submit" className={classes.button}>
            רכש מנוי
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
