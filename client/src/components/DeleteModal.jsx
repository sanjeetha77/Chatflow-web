import React from 'react';
import './DeleteModal.css';

const DeleteModal = ({ isOpen, title, onCancel, onDeleteForMe, onDeleteForEveryone, deleteText = "Delete for me" }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="delete-modal-title">{title}</h3>
        <div className="delete-modal-actions">
          {onDeleteForEveryone && (
            <button className="delete-modal-btn" onClick={onDeleteForEveryone}>
              Delete for everyone
            </button>
          )}
          <button className="delete-modal-btn" onClick={onDeleteForMe}>
            {deleteText}
          </button>
          <button className="delete-modal-btn cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
