import classes from "./header.module.css";
import React from "react";

/**
 * description: Header component
 * @returns JSX of component
 */
export default function Header() {
  return (
    <header className={classes.header}>
      <h1>Calisthenics</h1>
    </header>
  );
}
