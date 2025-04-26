import React from 'react';
import '../styles/developmentNoticeModal.css';

interface DevelopmentNoticeModalProps {
  onUnderstand: () => void;
}

const DevelopmentNoticeModal: React.FC<DevelopmentNoticeModalProps> = ({ onUnderstand }) => {
  return (
    <div className="dev-notice-modal-overlay">
      <div className="dev-notice-modal">
        <div className="dev-notice-modal-header">
          <h2>Development Notice</h2>
        </div>
        <div className="dev-notice-modal-content">
          <h3>⚠️ This Site is Under Development ⚠️</h3>
          <p>
            Welcome to the CIT-U Forums! Please be aware that this site is still in active development 
            for the IT342 course project.
          </p>
          <p>
            You may encounter errors, bugs, or incomplete features while using this platform. 
            We appreciate your patience and understanding as we continue to improve the site.
          </p>
          <p>
            If you find any issues, please be patient as the development team is working hard 
            to resolve them as quickly as possible.
          </p>
          <p>
            Thank you for your understanding and support!
          </p>
        </div>
        <div className="dev-notice-modal-footer">
          <button 
            className="understand-button" 
            onClick={onUnderstand}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentNoticeModal;
