import React, { useState } from 'react';
import { X, Send, FileText, Image as ImageIcon } from 'lucide-react';
import './FilePreviewModal.css';

const FilePreviewModal = ({ file, fileType, onClose, onSend }) => {
  const [caption, setCaption] = useState('');
  const isImage = fileType === 'image';

  return (
    <div className="file-preview-overlay">
      <div className="file-preview-container">
        <div className="file-preview-header">
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
          <span>Preview</span>
        </div>
        
        <div className="file-preview-main">
          {fileType === 'image' ? (
            <img src={URL.createObjectURL(file)} alt="preview" className="image-preview" />
          ) : fileType === 'video' ? (
            <video src={URL.createObjectURL(file)} controls className="video-preview" />
          ) : (
            <div className="doc-preview">
              <FileText size={80} color="#7f66ff" />
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          )}
        </div>

        <div className="file-preview-footer">
          <div className="caption-input-container">
            <input 
              type="text" 
              placeholder="Add a caption..." 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              autoFocus
            />
          </div>
          <button className="send-file-btn" onClick={() => onSend(file, caption)}>
            <div className="send-icon-circle">
              <Send size={24} color="white" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
