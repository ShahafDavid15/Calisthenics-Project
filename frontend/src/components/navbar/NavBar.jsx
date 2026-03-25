/**
 * NavBar component
 * Displays navigation links based on the user's role (admin or regular user).
 * Props: currentUser - the logged-in user object
 */

import React from "react";
import { Link } from "react-router-dom";
import classes from "./navbar.module.css";
import { isAdminUser } from "../../utils/isAdmin";

export default function NavBar({ currentUser }) {
  const isAdmin = isAdminUser(currentUser);

  return (
    <nav className={classes.navbar}>
      <ul className={classes.linkList}>
        {/* Home link - always visible */}
        <li className={classes.linkItem}>
          <Link to="/" className={classes.link}>
            דף הבית
          </Link>
        </li>

        {/* Links visible only to non-admin users */}
        {!isAdmin && (
          <>
            <li className={classes.linkItem}>
              <Link to="/profile" className={classes.link}>
                פרופיל
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

        {/* Admin-only links */}
        {isAdmin && (
          <>
            <li className={classes.linkItem}>
              <Link to="/membership" className={classes.link}>
                ניהול מנויים {/* Membership Management */}
              </Link>
            </li>
            <li className={classes.linkItem}>
              <Link to="/members" className={classes.link}>
                דף מנויים
              </Link>
            </li>
          </>
        )}

        {/* Link visible to all users: workouts page */}
        <li className={classes.linkItem}>
          <Link to="/workout" className={classes.link}>
            אימונים {/* Workouts */}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
