import React from 'react';
import classes from './messagemodal.module.css';

const MessageModal = ({ message, onClose, type = 'info' }) => {
  return (
    <div className={classes.modalOverlay}>
      <div className={`${classes.modalContent} ${classes[type]}`}>
        <h3>{type === 'error' ? 'שגיאה' : 'הודעה'}</h3>
        <p>{message}</p>
        <button onClick={onClose}>סגור</button>
      </div>
    </div>
  );
};

export default MessageModal;