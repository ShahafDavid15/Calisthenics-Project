import React, { useState, useEffect, useRef } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./purchaseMembership.module.css";
import { Link } from "react-router-dom";

export default function PurchaseMembership({ currentUser, onLogout }) {
  const [memberships, setMemberships] = useState([]);
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaypalButtons, setShowPaypalButtons] = useState(false);

  const paypalRef = useRef();

  const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

  // טוען את רשימת המנויים ומגדיר מנוי ראשון כברירת מחדל
  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const res = await fetch("/api/memberships");
        if (!res.ok) throw new Error("Failed to load memberships");
        const data = await res.json();
        const sorted = data.sort((a, b) => a.price - b.price);
        setMemberships(sorted);

        if (sorted.length > 0) {
          setSelectedMembershipId(sorted[0].membership_id); // ברירת מחדל - מנוי ראשון נבחר
        }
      } catch (err) {
        setMessage("שגיאה בטעינת המנויים");
        console.error("fetchMemberships error:", err);
      }
    };
    fetchMemberships();
  }, []);

  // טוען את SDK של PayPal ומציג את כפתורי התשלום עבור המנוי הנבחר
  useEffect(() => {
    if (!selectedMembershipId) {
      setShowPaypalButtons(false);
      return;
    }

    const selectedMembership = memberships.find(
      (m) => m.membership_id === selectedMembershipId
    );
    if (!selectedMembership) {
      setShowPaypalButtons(false);
      return;
    }

    setShowPaypalButtons(false);
    setMessage("");

    const addPaypalScript = () => {
      return new Promise((resolve) => {
        if (window.paypal) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=ILS`;
        script.addEventListener("load", resolve);
        script.addEventListener("error", () => {
          setMessage("לא ניתן לטעון את PayPal, נסה שוב מאוחר יותר");
          resolve();
        });
        document.body.appendChild(script);
      });
    };

    addPaypalScript().then(() => {
      setShowPaypalButtons(true);

      if (!window.paypal) {
        setMessage("PayPal לא זמין כרגע.");
        setShowPaypalButtons(false);
        return;
      }

      // ניקוי כפתורי PayPal ישנים לפני יצירת כפתור חדש
      if (paypalRef.current) {
        paypalRef.current.innerHTML = "";
      }

      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "paypal",
          },
          createOrder: function (data, actions) {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: selectedMembership.price.toString(),
                    currency_code: "ILS",
                  },
                  description: selectedMembership.name,
                },
              ],
            });
          },
          onApprove: function (data, actions) {
            setLoading(true);
            setMessage("מעבד את התשלום...");
            return actions.order.capture().then(async (details) => {
              try {
                const res = await fetch("/api/purchases", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    user_id: currentUser.user_id || currentUser.id,
                    membership_id: selectedMembershipId,
                    paypal_order_id: data.orderID,
                    payer_id: data.payerID,
                  }),
                });
                if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err.error || "Failed to record purchase");
                }
                setMessage("המנוי נרכש בהצלחה!");
                setSelectedMembershipId(null);
              } catch (err) {
                setMessage("שגיאה ברישום הרכישה: " + err.message);
              } finally {
                setLoading(false);
                setShowPaypalButtons(false);
              }
            });
          },
          onError: function (err) {
            setMessage("אירעה שגיאה בתשלום: " + err);
            setLoading(false);
            setShowPaypalButtons(false);
          },
          onCancel: function () {
            setMessage("התשלום בוטל.");
            setShowPaypalButtons(false);
          },
        })
        .render(paypalRef.current);
    });
  }, [selectedMembershipId, memberships, currentUser, paypalClientId]);

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
        <h2 className={classes.title}>רכישת מנוי</h2>

        {message && <div className={classes.message}>{message}</div>}

        <div className={classes.membershipsList}>
          {memberships.length === 0 ? (
            <p>טוען מנויים...</p>
          ) : (
            <ul className={classes.membershipCards}>
              {memberships.map((m) => (
                <li
                  key={m.membership_id}
                  className={`${classes.membershipItem} ${
                    selectedMembershipId === m.membership_id
                      ? classes.selected
                      : ""
                  } ${
                    m.name.toLowerCase() === "basic" ? classes.basicItem : ""
                  }`}
                  onClick={() => setSelectedMembershipId(m.membership_id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedMembershipId(m.membership_id);
                    }
                  }}
                  role="radio"
                  aria-checked={selectedMembershipId === m.membership_id}
                >
                  <input
                    type="radio"
                    name="membership"
                    value={m.membership_id}
                    checked={selectedMembershipId === m.membership_id}
                    onChange={() => setSelectedMembershipId(m.membership_id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className={classes.membershipInfo}>
                    <span className={classes.membershipName}>{m.name}</span>

                    <span className={classes.membershipPrice}>
                      <span className={classes.currency}>₪</span>
                      <span>{m.price}</span>
                    </span>

                    <span
                      className={classes.membershipDuration}
                      style={{
                        display: "inline-flex",
                        direction: "rtl",
                        gap: "0.25rem",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <span>{m.duration_days}</span>
                      <span className={classes.durationText}>ימים</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* מציג את כפתורי PayPal תמיד כשמנוי נבחר */}
        {showPaypalButtons && (
          <div ref={paypalRef} style={{ marginTop: "1rem" }}></div>
        )}

        {!selectedMembershipId && (
          <p style={{ marginTop: "1rem", color: "red" }}>
            אנא בחר מנוי כדי להציג את אפשרות התשלום
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
