import React, { useState, useEffect, useRef } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import NavBar from "../components/navbar/NavBar";
import classes from "./purchaseMembership.module.css";

export default function PurchaseMembership({ currentUser, onLogout }) {
  // State for list of memberships fetched from backend
  const [memberships, setMemberships] = useState([]);

  // Currently selected membership ID (from radio list)
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);

  // Status or error messages to show to user
  const [message, setMessage] = useState("");

  // Flag to control whether PayPal buttons are rendered
  const [showPaypalButtons, setShowPaypalButtons] = useState(false);

  // Ref to container DOM element for PayPal buttons
  const paypalRef = useRef();

  // PayPal client ID from environment variables (for SDK loading)
  const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

  // On component mount: fetch memberships from backend API
  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const res = await fetch("/api/memberships");

        if (!res.ok) throw new Error("Failed to load memberships");

        const data = await res.json();

        // Sort memberships by price ascending for UI display
        const sorted = data.sort((a, b) => a.price - b.price);

        setMemberships(sorted);

        // Automatically select the first membership if available
        if (sorted.length > 0) {
          setSelectedMembershipId(sorted[0].membership_id);
        }
      } catch (err) {
        // Show error message if fetching fails
        setMessage("שגיאה בטעינת המנויים");
        console.error("fetchMemberships error:", err);
      }
    };

    fetchMemberships();
  }, []);

  // Effect triggered when selected membership or memberships list changes
  useEffect(() => {
    // If no membership selected, hide PayPal buttons
    if (!selectedMembershipId) {
      setShowPaypalButtons(false);
      return;
    }

    // Find membership object from selected ID
    const selectedMembership = memberships.find(
      (m) => m.membership_id === selectedMembershipId
    );

    if (!selectedMembership) {
      // If selection is invalid, hide PayPal buttons
      setShowPaypalButtons(false);
      return;
    }

    // Clear any messages and hide PayPal buttons while loading script
    setMessage("");
    setShowPaypalButtons(false);

    // Function to dynamically add PayPal SDK script tag to document
    const addPaypalScript = () => {
      return new Promise((resolve) => {
        if (window.paypal) {
          // SDK already loaded - resolve immediately
          resolve();
          return;
        }

        // Create script element
        const script = document.createElement("script");

        // Set PayPal SDK URL with client ID and currency (ILS - Israeli Shekel)
        script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=ILS`;

        // Resolve promise when script loads successfully
        script.addEventListener("load", resolve);

        // Handle script loading errors by showing message but still resolve to avoid hanging
        script.addEventListener("error", () => {
          setMessage("לא ניתן לטעון את PayPal, נסה שוב מאוחר יותר");
          resolve();
        });

        // Append script to document body
        document.body.appendChild(script);
      });
    };

    // Load PayPal SDK, then show buttons if available
    addPaypalScript().then(() => {
      if (!window.paypal) {
        setMessage("PayPal לא זמין כרגע.");
        setShowPaypalButtons(false);
        return;
      }
      setShowPaypalButtons(true);
    });
  }, [selectedMembershipId, memberships, paypalClientId]);

  // Effect to render PayPal buttons whenever showPaypalButtons is true
  useEffect(() => {
    // Only run if PayPal buttons should be shown and ref is ready
    if (!showPaypalButtons || !paypalRef.current) return;

    const container = paypalRef.current;

    // Find selected membership info again
    const selectedMembership = memberships.find(
      (m) => m.membership_id === selectedMembershipId
    );

    if (!selectedMembership) {
      setShowPaypalButtons(false);
      return;
    }

    // Clear previous PayPal buttons if any
    container.innerHTML = "";

    // Initialize and render PayPal Buttons with config and event handlers
    const paypalButtons = window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "paypal",
      },

      // Called when creating the order (payment details)
      createOrder: (data, actions) => {
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

      // Called on payment approval - finalize the transaction
      onApprove: (data, actions) => {
        setMessage("מעבד את התשלום...");

        return actions.order.capture().then(async (details) => {
          try {
            // Send purchase details to backend for recording
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

            // Success message and reset selection/buttons
            setMessage("המנוי נרכש בהצלחה!");
            setSelectedMembershipId(null);
            setShowPaypalButtons(false);
          } catch (err) {
            setMessage("שגיאה ברישום הרכישה: " + err.message);
            setShowPaypalButtons(false);
          }
        });
      },

      // Called on PayPal error
      onError: (err) => {
        setMessage("אירעה שגיאה בתשלום: " + err);
        setShowPaypalButtons(false);
      },

      // Called if user cancels the payment
      onCancel: () => {
        setMessage("התשלום בוטל.");
        setShowPaypalButtons(false);
      },
    });

    // Render buttons into container
    paypalButtons.render(container);

    // Cleanup function to remove buttons when dependencies change or component unmounts
    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [showPaypalButtons, selectedMembershipId, memberships, currentUser]);

  return (
    <div className={classes.container}>
      <Header />
      <NavBar />

      {/* Logout button */}
      <button onClick={onLogout} className={classes.logoutButton}>
        התנתקות
      </button>

      <main className={classes.main}>
        <h2 className={classes.title}>רכישת מנוי</h2>

        {/* Display status or error message */}
        {message && <div className={classes.message}>{message}</div>}

        <div className={classes.membershipsList}>
          {memberships.length === 0 ? (
            // Show loading message while memberships load
            <p>טוען מנויים...</p>
          ) : (
            // List memberships as selectable radio group with accessible roles and keyboard handlers
            <ul
              className={classes.membershipCards}
              role="radiogroup"
              aria-label="בחירת מנוי"
            >
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
                  {/* Hidden radio input for form semantics */}
                  <input
                    type="radio"
                    name="membership"
                    value={m.membership_id}
                    checked={selectedMembershipId === m.membership_id}
                    onChange={() => setSelectedMembershipId(m.membership_id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`בחר מנוי ${m.name}`}
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

        {/* Render PayPal buttons container when enabled */}
        {showPaypalButtons && (
          <div ref={paypalRef} style={{ marginTop: "1rem" }}></div>
        )}

        {/* If no membership selected, show a warning */}
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
