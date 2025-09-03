/**
 PurchaseMembership.jsx
 This page fetches membership options from the backend, checks if the user already has an active membership, and integrates PayPal payment.
 */

import React, { useState, useEffect, useRef } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./purchaseMembership.module.css";

export default function PurchaseMembership({ currentUser, onLogout }) {
  const [memberships, setMemberships] = useState([]);
  const [selectedMembershipName, setSelectedMembershipName] = useState("");
  const [message, setMessage] = useState("");
  const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingSdk, setLoadingSdk] = useState(true);
  const [activeMembership, setActiveMembership] = useState(null);
  const paypalRef = useRef();

  const VAT_PERCENT = 18;

  // calculate price with VAT and round to integer
  const calculatePriceWithVAT = (price) => {
    return Math.round(price * (1 + VAT_PERCENT / 100));
  };

  // Fetch memberships from backend
  useEffect(() => {
    fetch("http://localhost:3002/api/memberships")
      .then((res) => res.json())
      .then((data) => {
        setMemberships(data);
        if (data.length > 0) setSelectedMembershipName(data[0].name);
      })
      .catch((err) => console.error("Error fetching memberships:", err));
  }, []);

  // Fetch active membership for current user
  useEffect(() => {
    if (!currentUser?.user_id && !currentUser?.id) return;

    const userId = currentUser?.user_id || currentUser?.id;
    fetch(
      `http://localhost:3002/api/purchases/active-membership?user_id=${userId}`
    )
      .then((res) => res.json())
      .then((active) => {
        if (active) {
          setActiveMembership(active.membership_name);
          setMessage(`יש לך כבר מנוי פעיל: ${active.membership_name}`);
        } else {
          setActiveMembership(null);
          setMessage("");
        }
      })
      .catch((err) => console.error(err));
  }, [currentUser]);

  // Load PayPal SDK
  useEffect(() => {
    const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    if (!paypalClientId) {
      setMessage("PayPal Client ID לא מוגדר. בדוק את .env");
      setLoadingSdk(false);
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="paypal.com/sdk/js"]'
    );
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=ILS&intent=capture&enable-funding=card`;
    script.async = true;
    script.onload = () => {
      setIsPaypalLoaded(true);
      setLoadingSdk(false);
    };
    script.onerror = () => {
      setMessage("לא ניתן לטעון את PayPal SDK, נסה שוב מאוחר יותר");
      setLoadingSdk(false);
    };
    document.body.appendChild(script);

    // Cleanup the script when component unmounts
    return () => document.body.removeChild(script);
  }, []);

  // Render PayPal Buttons
  useEffect(() => {
    if (!isPaypalLoaded || !paypalRef.current || !selectedMembershipName)
      return;

    const container = paypalRef.current;
    container.innerHTML = "";
    const selectedMembership = memberships.find(
      (m) => m.name === selectedMembershipName
    );
    if (!selectedMembership) return;

    const priceWithVAT = calculatePriceWithVAT(selectedMembership.price);

    let isCancelled = false;

    const buttons = window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "paypal",
      },

      // Create an order when user clicks PayPal button
      createOrder: async () => {
        if (isCancelled) throw new Error("Payment cancelled");

        const userId = currentUser?.user_id || currentUser?.id;
        if (!userId) {
          setMessage("שגיאה: משתמש לא מזוהה");
          throw new Error("User ID missing");
        }

        if (activeMembership) {
          setMessage(`כבר יש לך מנוי פעיל: ${activeMembership}`);
          throw new Error("Cannot purchase active membership");
        }

        setIsProcessing(true);
        try {
          const res = await fetch(
            "http://localhost:3002/api/purchases/create-order",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                membership_name: selectedMembershipName.trim(),
                price: priceWithVAT,
              }),
            }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to create order");
          return data.orderID;
        } catch (err) {
          setMessage("שגיאה ביצירת הזמנה: " + err.message);
          setIsProcessing(false);
          throw err;
        }
      },

      // Capture payment after approval
      onApprove: async (data) => {
        if (isCancelled) return;
        try {
          const captureRes = await fetch(
            "http://localhost:3002/api/purchases/capture-order",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID }),
            }
          );
          const captureData = await captureRes.json();
          if (!captureRes.ok)
            throw new Error(captureData.error || "Failed to capture payment");

          const userId = currentUser?.user_id || currentUser?.id;
          const purchaseRes = await fetch(
            "http://localhost:3002/api/purchases/purchase-membership",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: userId,
                membership_name: selectedMembershipName.trim(),
                paypal_order_id: data.orderID,
                payer_id: data.payerID || data.payerId,
                price: priceWithVAT,
              }),
            }
          );
          const purchaseData = await purchaseRes.json();
          if (!purchaseRes.ok) {
            if (purchaseRes.status === 409) throw new Error(purchaseData.error);
            throw new Error(purchaseData.error || "Failed to record purchase");
          }

          if (!isCancelled) {
            setMessage(
              `המנוי "${selectedMembershipName}" נרכש בהצלחה! מחיר לתשלום: ₪${priceWithVAT}`
            );
            setActiveMembership(selectedMembershipName);
          }
        } catch (err) {
          if (!isCancelled)
            setMessage("אירעה שגיאה בתהליך התשלום: " + err.message);
        } finally {
          if (!isCancelled) setIsProcessing(false);
        }
      },

      // Handle PayPal errors
      onError: (err) => {
        if (!isCancelled) {
          setMessage("אירעה שגיאה: " + err);
          setIsProcessing(false);
        }
      },

      // Handle user canceling the payment
      onCancel: () => {
        if (!isCancelled) {
          setMessage("התשלום בוטל.");
          setIsProcessing(false);
        }
      },
    });

    buttons.render(container).catch((err) => {
      if (!isCancelled) console.error("PayPal render error:", err);
    });

    return () => {
      isCancelled = true;
      if (container) container.innerHTML = "";
    };
  }, [
    isPaypalLoaded,
    selectedMembershipName,
    memberships,
    currentUser,
    activeMembership,
  ]);

  return (
    <div className={classes.container}>
      <Header />
      <NavBar />
      <button
        onClick={onLogout}
        className={classes.logoutButton}
        disabled={isProcessing}
      >
        התנתקות
      </button>

      <main className={classes.main}>
        <h2 className={classes.title}>רכישת מנוי</h2>
        {message && <div className={classes.message}>{message}</div>}

        <div className={classes.membershipsList}>
          {memberships.length === 0 ? (
            <p>טוען מנויים...</p>
          ) : (
            <ul className={classes.membershipCards} role="radiogroup">
              {memberships.map((m) => (
                <li
                  key={m.membership_id}
                  className={`${classes.membershipItem} ${
                    selectedMembershipName === m.name ? classes.selected : ""
                  } ${activeMembership ? classes.disabled : ""}`}
                  onClick={() =>
                    !isProcessing &&
                    !activeMembership &&
                    setSelectedMembershipName(m.name)
                  }
                  tabIndex={0}
                >
                  <input
                    type="radio"
                    name="membership"
                    value={m.name}
                    checked={selectedMembershipName === m.name}
                    onChange={() =>
                      !isProcessing &&
                      !activeMembership &&
                      setSelectedMembershipName(m.name)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className={classes.membershipInfo}>
                    <span className={classes.membershipName}>{m.name}</span>
                    <span className={classes.membershipPrice}>
                      {m.entry_count} כניסות, {m.duration_days} ימים, ₪
                      {calculatePriceWithVAT(m.price).toLocaleString("he-IL")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {loadingSdk && <p>טוען PayPal...</p>}
        <div ref={paypalRef} className={classes.paypalButtons} />
      </main>

      <Footer />
    </div>
  );
}
