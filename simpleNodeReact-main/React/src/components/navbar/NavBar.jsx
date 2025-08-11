import React from "react";
import { Link } from "react-router-dom";
import classes from "./navbar.module.css";

export default function NavBar({ currentUser }) {
  const isAdmin =
    currentUser?.name === "admin" || currentUser?.role === "admin";

  return (
    <nav className={classes.navbar}>
      <ul className={classes.linkList}>
        <li className={classes.linkItem}>
          <Link to="/" className={classes.link}>
            דף הבית
          </Link>
        </li>

        {/* אם לא אדמין, מציגים את הקישורים האלו */}
        {!isAdmin && (
          <>
            <li className={classes.linkItem}>
              <Link to="/profile" className={classes.link}>
                פרטים אישיים
              </Link>
            </li>
            <li className={classes.linkItem}>
              <Link to="/purchase-membership" className={classes.link}>
                רכישת מנוי
              </Link>
            </li>
            <li className={classes.linkItem}>
              <Link to="/workoutdetails" className={classes.link}>
                נתוני אימון
              </Link>
            </li>
          </>
        )}

        {/* קישור ניהול מנויים רק אם אדמין */}
        {isAdmin && (
          <li className={classes.linkItem}>
            <Link to="/membership" className={classes.link}>
              ניהול מנויים
            </Link>
          </li>
        )}

        {/* קישורים שמשותפים לכולם */}
        <li className={classes.linkItem}>
          <Link to="/workout" className={classes.link}>
            אימונים
          </Link>
        </li>
      </ul>
    </nav>
  );
}
