/**
 * MessageModal component
 * Displays a modal dialog with a message and action buttons.
 * Props:
 * message: the text content to display
 * onClose: callback when the modal is closed
 * type: "error" or "info"/"success" , affects header and button styling
 * onConfirm: optional callback for confirm action
 * confirmText: text for confirm button
 * cancelText: text for cancel button
 *
 * Can be used for error messages, informational messages, or confirmations.
 */

import React from "react";
import classes from "./messagemodal.module.css";

const MessageModal = ({
  message,
  onClose,
  type = "info",
  onConfirm,
  confirmText = "אישור",
  cancelText = "ביטול",
}) => (
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

export default MessageModal;
