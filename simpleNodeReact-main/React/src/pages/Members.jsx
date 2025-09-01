import React, { useState, useEffect } from "react";
import Header from "../components/header/Header";
import NavBar from "../components/navbar/NavBar";
import Footer from "../components/footer/Footer";
import classes from "./members.module.css";
import MessageModal from "../components/messagemodal/MessageModal";

/**
 * Members page - shows all users and their memberships
 */
export default function Members({ currentUser, onLogout }) {
  const [users, setUsers] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    type: "info",
    confirmable: false,
    onConfirm: null,
    confirmText: "אישור",
    cancelText: "ביטול",
  });

  /** Fetch all users with membership info */
  const loadUsers = async () => {
    try {
      const res = await fetch("http://localhost:3002/api/users");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setMessage({
        text: err.message || "שגיאה בטעינת משתמשים",
        type: "error",
        confirmable: false,
      });
      setShowMessage(true);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className={classes.container}>
      <Header />
      <NavBar currentUser={currentUser} />
      <main className={classes.main}>
        <button onClick={onLogout} className={classes.logoutButton}>
          התנתקות
        </button>

        {showMessage && (
          <MessageModal
            message={message.text}
            type={message.type}
            onClose={() => setShowMessage(false)}
            onConfirm={message.confirmable ? message.onConfirm : null}
            confirmText={message.confirmText}
            cancelText={message.cancelText}
          />
        )}

        <h2 className={classes.title}>רשימת משתמשים ומנויים</h2>

        <div className={classes.userWorkouts}>
          <table className={classes.statsTable}>
            <thead>
              <tr>
                <th>שם משתמש</th>
                <th>אימייל</th>
                <th>סוג מנוי</th>
                <th>תאריך התחלה</th>
                <th>תאריך סיום</th>
                <th>ימים שנותרו</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(
                  (user) => user.role !== "admin" && user.username !== "admin"
                )
                .sort((a, b) => {
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);

                  const endA = a.end_date ? new Date(a.end_date) : null;
                  if (endA) endA.setHours(0, 0, 0, 0);
                  const daysLeftA = endA
                    ? Math.floor((endA - now) / (1000 * 60 * 60 * 24))
                    : Infinity;

                  const endB = b.end_date ? new Date(b.end_date) : null;
                  if (endB) endB.setHours(0, 0, 0, 0);
                  const daysLeftB = endB
                    ? Math.floor((endB - now) / (1000 * 60 * 60 * 24))
                    : Infinity;

                  return daysLeftA - daysLeftB;
                })
                .map((user) => {
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);

                  const endDate = user.end_date
                    ? new Date(user.end_date)
                    : null;
                  if (endDate) endDate.setHours(0, 0, 0, 0);

                  const daysLeft = endDate
                    ? Math.floor((endDate - now) / (1000 * 60 * 60 * 24))
                    : null;

                  const isExpiringSoon =
                    daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

                  return (
                    <tr
                      key={user.user_id}
                      className={isExpiringSoon ? classes.expiringRow : ""}
                    >
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.membership_type || "-"}</td>
                      <td>
                        {user.start_date
                          ? new Date(user.start_date).toLocaleDateString(
                              "he-IL"
                            )
                          : "-"}
                      </td>
                      <td>
                        {user.end_date
                          ? new Date(user.end_date).toLocaleDateString("he-IL")
                          : "-"}
                      </td>
                      <td>
                        {daysLeft !== null && daysLeft >= 0
                          ? daysLeft
                          : daysLeft < 0
                          ? "אין מנוי פעיל"
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
