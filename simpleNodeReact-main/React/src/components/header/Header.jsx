import classes from "./header.module.css";
import React from "react";

/**
 * Header component
 * Renders the main header with the app title
 * @returns JSX element representing the header
 */
export default function Header() {
  return (
    <header className={classes.header}>
      <h1>Calisthenics</h1>
    </header>
  );
}
