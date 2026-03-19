/**
 * LoadingSpinner - displays a loading indicator
 */
import React from "react";
import classes from "./loading.module.css";

export default function LoadingSpinner({ text = "טוען..." }) {
  return (
    <div className={classes.container}>
      <div className={classes.spinner} />
      {text && <p className={classes.text}>{text}</p>}
    </div>
  );
}
