import classes from "./footer.module.css";
import React from "react";

/**
 * Footer component
 * Displays a footer with the current year and author name
 * @returns JSX element representing the footer
 */
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
