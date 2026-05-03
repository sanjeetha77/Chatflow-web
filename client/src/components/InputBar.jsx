import React, { useState, useRef, useEffect, useContext } from 'react';
import { Plus, Smile, Mic, Send, FileText, Image as ImageIcon, X, Trash2, Edit } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { socket } from '../socket/socket';
import { sendMessage, uploadFile, editMessage } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import FilePreviewModal from './FilePreviewModal';

const InputBar = ({ onSendMessage, disabled, droppedFile, onClearDroppedFile }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image' or 'doc' or 'audio'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordingIntervalRef = useRef(null);
  
  useEffect(() => {
    if (droppedFile) {
      setSelectedFile(droppedFile);
      const isImage = droppedFile.type.startsWith('image/');
      setFileType(isImage ? 'image' : 'doc');
      onClearDroppedFile();
    }
  }, [droppedFile, onClearDroppedFile]);
  
  const emojiPickerRef = useRef(null);
  const plusMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  
  const { currentUser } = useContext(AuthContext);
  const { selectedChat, setMessages, editingMessage, setEditingMessage } = useContext(ChatContext);
  const shouldSendRef = useRef(false);

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.message);
      textareaRef.current?.focus();
    } else {
      setMessage('');
    }
  }, [editingMessage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setShowPlusMenu(false);
      }
    };
    if (showPlusMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPlusMenu]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileType('doc');
      setShowPlusMenu(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileType('image');
      setShowPlusMenu(false);
    }
  };

  const handleSendFile = async (file, caption, type) => {
    if (!selectedChat || !currentUser) return;
    
    const actualFileType = type || fileType;
    
    try {
      const result = await uploadFile(currentUser._id, selectedChat._id, file, actualFileType, caption);
      
      // Emit via socket
      socket.emit('sendMessage', result);
      
      // Update local state
      setMessages(prev => [...prev, result]);
      
      // Reset state
      setSelectedFile(null);
      setFileType(null);
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleTyping = () => {
    if (!selectedChat || !currentUser) return;
    socket.emit('typing', { senderId: currentUser._id, receiverId: selectedChat._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { senderId: currentUser._id, receiverId: selectedChat._id });
    }, 2000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        if (!shouldSendRef.current) {
          mediaRecorder?.stream.getTracks().forEach(track => track.stop());
          return;
        }
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
        handleSendFile(file, '', 'audio');
      };

      shouldSendRef.current = false;
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      shouldSendRef.current = true;
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      shouldSendRef.current = false;
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (message.trim() && !disabled) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit('stopTyping', { senderId: currentUser._id, receiverId: selectedChat._id });
      
      if (editingMessage) {
        try {
          const updated = await editMessage(editingMessage._id, message);
          setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
          socket.emit('messageEdited', { 
            ...updated, 
            receiverId: selectedChat._id 
          });
          setEditingMessage(null);
        } catch (error) {
          console.error('Failed to edit message:', error);
        }
      } else {
        onSendMessage(message); // Pass full message (CSS handles pre-wrap)
      }
      
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    handleTyping();
  };

  return (
    <div className="input-bar-wrapper">
      {showEmojiPicker && (
        <div className="emoji-picker-container" ref={emojiPickerRef}>
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            theme="dark" 
            width="100%"
            height={350}
            skinTonesDisabled
            searchPlaceHolder="Search emoji"
          />
        </div>
      )}

      {editingMessage && (
        <div className="editing-preview animate-slide-up">
          <div className="editing-info">
            <Edit size={16} color="var(--accent-green)" />
            <div className="editing-text">
              <span className="editing-label">Edit message</span>
              <span className="editing-content">{editingMessage.message}</span>
            </div>
          </div>
          <X size={18} className="close-btn" onClick={() => setEditingMessage(null)} />
        </div>
      )}

      <div className="input-bar-main">
        {isRecording ? (
          <div className="recording-ui">
            <div className="recording-info">
              <div className="recording-dot"></div>
              <span className="recording-timer">{formatDuration(recordingTime)}</span>
            </div>
            <button className="input-btn cancel-btn" onClick={cancelRecording}>
              <Trash2 size={22} color="#ff4b4b" />
            </button>
          </div>
        ) : (
          <div className="input-actions-left">
            <button className="input-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <Smile size={24} className={showEmojiPicker ? 'active' : ''} />
            </button>
            
            <div className="plus-menu-container" ref={plusMenuRef}>
              {showPlusMenu && (
                <div className="plus-dropdown">
                  <div className="plus-item" onClick={() => fileInputRef.current.click()}>
                    <div className="plus-icon document"><FileText size={20} /></div>
                    <span>Document</span>
                  </div>
                  <div className="plus-item" onClick={() => imageInputRef.current.click()}>
                    <div className="plus-icon image"><ImageIcon size={20} /></div>
                    <span>Photos & Videos</span>
                  </div>
                </div>
              )}
              <button className="input-btn" onClick={() => setShowPlusMenu(!showPlusMenu)}>
                <Plus size={24} className={showPlusMenu ? 'active rotate-45' : ''} />
              </button>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileSelect}
            />
            <input 
              type="file" 
              accept="image/*,video/*" 
              ref={imageInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImageSelect}
            />
          </div>
        )}
        
        {!isRecording && (
          <div className="input-field-container">
            <textarea
              ref={textareaRef}
              rows="1"
              placeholder="Type a message"
              value={message}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              disabled={disabled}
              onFocus={() => setShowEmojiPicker(false)}
            />
          </div>
        )}

        <div className="input-actions-right">
          {message.trim() || isRecording ? (
            <button className="send-btn" onClick={isRecording ? stopRecording : handleSubmit} disabled={disabled}>
              <Send size={24} />
            </button>
          ) : (
            <button className="input-btn mic-btn" onClick={startRecording} disabled={disabled}>
              <Mic size={24} />
            </button>
          )}
        </div>
      </div>

      {selectedFile && (
        <FilePreviewModal 
          file={selectedFile} 
          fileType={fileType} 
          onClose={() => { setSelectedFile(null); setFileType(null); }}
          onSend={(file, caption) => handleSendFile(file, caption)}
        />
      )}
    </div>
  );
};

export default InputBar;
