/**
 PurchaseMembership.jsx.
 This page fetches membership options from the backend, checks if the user already has an active membership, and integrates PayPal payment.
 */

import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../utils/api";
import Header from "../components/header/Header";
import LoadingSpinner from "../components/loading/LoadingSpinner";
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
  const [loadingMemberships, setLoadingMemberships] = useState(true);
  const [activeMembership, setActiveMembership] = useState(null);
  const paypalRef = useRef();

  const VAT_PERCENT = 18;

  // calculate price with VAT and round to integer
  const calculatePriceWithVAT = (price) => {
    return Math.round(price * (1 + VAT_PERCENT / 100));
  };

  const apiBase =
    process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "";

  // Fetch memberships from backend
  useEffect(() => {
    setLoadingMemberships(true);
    apiFetch(`${apiBase || ""}/api/memberships`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || res.statusText);
        return data;
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setMemberships(list);
        if (list.length > 0) setSelectedMembershipName(list[0].name);
      })
      .catch(() => {
        setMessage("שגיאה בטעינת המנויים. נסה לרענן את הדף.");
      })
      .finally(() => setLoadingMemberships(false));
  }, [apiBase]);

  // Fetch active membership for current user
  useEffect(() => {
    if (!currentUser?.id) return;

    apiFetch(`${apiBase || ""}/api/purchases/active-membership`)
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
  }, [currentUser, apiBase]);

  // Load PayPal SDK (Client ID from REACT_APP_* or public backend endpoint)
  useEffect(() => {
    let cancelled = false;

    const removePaypalScript = () => {
      const existing = document.querySelector(
        'script[src*="paypal.com/sdk/js"]'
      );
      if (existing?.parentNode) existing.parentNode.removeChild(existing);
    };

    async function loadPayPalSdk() {
      setLoadingSdk(true);
      setIsPaypalLoaded(false);

      let clientId = (process.env.REACT_APP_PAYPAL_CLIENT_ID || "").trim();

      let currency = (
        process.env.REACT_APP_PAYPAL_CURRENCY || "ILS"
      ).toUpperCase();

      try {
        const res = await fetch(
          `${apiBase || ""}/api/purchases/paypal-client-id`
        );
        const data = await res.json();
        if (data?.currency) currency = String(data.currency).toUpperCase();
        if (!clientId && data?.clientId) clientId = String(data.clientId).trim();
      } catch {
        if (!clientId) {
          if (!cancelled) {
            setMessage("לא ניתן לטעון הגדרות PayPal מהשרת.");
            setLoadingSdk(false);
          }
          return;
        }
        // Align with backend default (ILS); override with REACT_APP_PAYPAL_CURRENCY if needed
        currency = (
          process.env.REACT_APP_PAYPAL_CURRENCY || "ILS"
        ).toUpperCase();
      }

      if (cancelled) return;

      if (!clientId) {
        setMessage(
          "PayPal לא מוגדר: הוסף PAYPAL_CLIENT_ID ל-backend/.env (או REACT_APP_PAYPAL_CLIENT_ID ל-frontend/.env) והפעל מחדש את השרתים."
        );
        setLoadingSdk(false);
        return;
      }

      removePaypalScript();

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        clientId
      )}&currency=${encodeURIComponent(
        currency
      )}&intent=capture&components=buttons&enable-funding=card`;
      script.async = true;
      script.onload = () => {
        if (!cancelled) {
          setIsPaypalLoaded(true);
          setLoadingSdk(false);
        }
      };
      script.onerror = () => {
        if (!cancelled) {
          setMessage("לא ניתן לטעון את PayPal SDK, נסה שוב מאוחר יותר");
          setLoadingSdk(false);
        }
      };
      document.body.appendChild(script);
    }

    loadPayPalSdk();

    return () => {
      cancelled = true;
      removePaypalScript();
    };
  }, [apiBase]);

  // Render PayPal Buttons (defer one frame so ref is attached after paint)
  useEffect(() => {
    if (!isPaypalLoaded || !selectedMembershipName || !window.paypal?.Buttons)
      return;

    const selectedMembership = memberships.find(
      (m) => m.name === selectedMembershipName
    );
    if (!selectedMembership) return;

    const priceWithVAT = calculatePriceWithVAT(selectedMembership.price);

    let isCancelled = false;
    let mountEl = null;
    const frameId = requestAnimationFrame(() => {
      mountEl = paypalRef.current;
      const container = mountEl;
      if (!container || isCancelled) return;
      container.innerHTML = "";

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

        if (!currentUser?.id) {
          setMessage("שגיאה: משתמש לא מזוהה");
          throw new Error("User not identified");
        }

        if (activeMembership) {
          setMessage(`כבר יש לך מנוי פעיל: ${activeMembership}`);
          throw new Error("Cannot purchase active membership");
        }

        setIsProcessing(true);
        try {
          const res = await apiFetch(
            `${apiBase || ""}/api/purchases/create-order`,
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
          const captureRes = await apiFetch(
            `${apiBase || ""}/api/purchases/capture-order`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID }),
            }
          );
          const captureData = await captureRes.json();
          if (!captureRes.ok)
            throw new Error(captureData.error || "Failed to capture payment");

          const purchaseRes = await apiFetch(
            `${apiBase || ""}/api/purchases/purchase-membership`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
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
          const detail =
            err && typeof err === "object"
              ? err.message || JSON.stringify(err)
              : String(err);
          setMessage("אירעה שגיאה: " + detail);
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
      if (!isCancelled) {
        console.error("PayPal render error:", err);
        setMessage(
          "לא ניתן להציג כפתורי PayPal. בדוק את הקונסול בדפדפן ואת הגדרות PayPal ב-.env."
        );
      }
    });
    });

    return () => {
      isCancelled = true;
      cancelAnimationFrame(frameId);
      if (mountEl) mountEl.innerHTML = "";
    };
  }, [
    apiBase,
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
          {loadingMemberships ? (
            <LoadingSpinner text="טוען מנויים..." />
          ) : memberships.length === 0 ? (
            <p>לא נמצאו מנויים</p>
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
                    <span className={classes.membershipEntries}>{m.entry_count} כניסות</span>
                    <span className={classes.membershipDays}>{m.duration_days} ימים</span>
                    <span className={classes.membershipPrice}>
                      ₪{calculatePriceWithVAT(m.price).toLocaleString("he-IL")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {loadingSdk && <LoadingSpinner text="טוען PayPal..." />}
        <div ref={paypalRef} className={classes.paypalButtons} />
      </main>

      <Footer />
    </div>
  );
}
