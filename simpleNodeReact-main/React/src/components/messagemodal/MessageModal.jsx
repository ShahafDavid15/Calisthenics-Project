import React from "react";
import classes from "./messagemodal.module.css";

// MessageModal component displays a modal dialog with a message.
// type: "error" (red button) or "success"/"info" (gray button)
const MessageModal = ({
  message,
  onClose,
  type = "info",
  onConfirm,
  confirmText = "אישור",
  cancelText = "ביטול",
}) => {
  return (
    <div className={classes.modalOverlay}>
      <div className={classes.modalContent}>
        <h3>{type === "error" ? "שגיאה" : "הודעה"}</h3>
        <p>{message}</p>
        <div className={classes.buttonGroup}>
          {onConfirm ? (
            <>
              <button onClick={onConfirm} className={classes.confirmBtn}>
                {confirmText}
              </button>
              <button onClick={onClose} className={classes.deleteCancelBtn}>
                {cancelText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={
                type === "error"
                  ? classes.errorCancelBtn
                  : classes.neutralCancelBtn
              }
            >
              סגור
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
