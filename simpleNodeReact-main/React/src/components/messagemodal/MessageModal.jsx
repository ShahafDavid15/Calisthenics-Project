import React from "react";
import classes from "./messagemodal.module.css";

const MessageModal = ({ message, onClose, type = "info", onConfirm }) => {
  return (
    <div className={classes.modalOverlay}>
      <div className={`${classes.modalContent} ${classes[type]}`}>
        <h3>{type === "error" ? "שגיאה" : "הודעה"}</h3>
        <p>{message}</p>
        <div className={classes.buttonGroup}>
          {onConfirm ? (
            <>
              <button onClick={onConfirm} className={classes.confirmBtn}>
                הזמנת אימון
              </button>
              <button onClick={onClose} className={classes.cancelBtn}>
                ביטול
              </button>
            </>
          ) : (
            <button onClick={onClose} className={classes.cancelBtn}>
              סגור
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
