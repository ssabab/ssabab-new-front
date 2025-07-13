import React from 'react';

interface MessageBoxProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
}

export default function MessageBox({ isVisible, message, onClose }: MessageBoxProps) {
  return (
    <div id="messageBoxOverlay" className={`message-box-overlay ${isVisible ? 'visible' : ''}`} onClick={onClose}>
      <div className="message-box-content" onClick={(e) => e.stopPropagation()}>
        <p id="messageBoxText">{message}</p>
      </div>
    </div>
  );
}