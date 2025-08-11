import React from "react";
import classes from "./messagemodal.module.css";

// MessageModal component displays a modal dialog with a message.
// It supports different types (e.g. "error", "info") that affect styling.
// If onConfirm callback is provided, it shows confirm and cancel buttons.
// Otherwise, it shows a single close button.
const MessageModal = ({
  message,
  onClose,
  type = "info",
  onConfirm,
  confirmText = "אישור",
  cancelText = "ביטול",
}) => {
  return (
    // Modal overlay covers the entire screen and centers the modal content
    <div className={classes.modalOverlay}>
      {/* Modal content container with dynamic styling based on type */}
      <div className={`${classes.modalContent} ${classes[type]}`}>
        {/* Modal header: shows "Error" if type is error, else generic "Message" */}
        <h3>{type === "error" ? "שגיאה" : "הודעה"}</h3>

        {/* The main message text */}
        <p>{message}</p>

        {/* Button group: conditional rendering based on presence of onConfirm */}
        <div className={classes.buttonGroup}>
          {onConfirm ? (
            <>
              {/* Cancel button קודם */}
              <button onClick={onClose} className={classes.cancelBtn}>
                {cancelText}
              </button>

              {/* Confirm button אחרי */}
              <button onClick={onConfirm} className={classes.confirmBtn}>
                {confirmText}
              </button>
            </>
          ) : (
            // Single close button when no confirm action needed
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
