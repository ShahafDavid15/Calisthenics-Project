/**
 * Header component for the application.
 * Renders the main header with the app title "Calisthenics".
 * Presentational component without state or side effects.
 */

import classes from "./header.module.css";
import React from "react";

export default function Header() {
  return (
    <header className={classes.header}>
      <h1>Calisthenics</h1>
    </header>
  );
}
