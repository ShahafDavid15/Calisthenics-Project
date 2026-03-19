/**
 * Footer component for the application.
 * Displays a footer section with the current year and author name.
 */

import classes from "./footer.module.css";
import React from "react";

export default function Footer() {
  // Get the current year dynamically
  const date = new Date().getFullYear();

  return (
    <footer className={classes.footer}>
      <p className={classes.myP + " " + classes.temp}>
        {" "}
        <span>&copy;</span> {date} Shahaf David
      </p>
    </footer>
  );
}
