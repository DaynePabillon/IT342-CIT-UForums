import React, { useState, useEffect } from 'react';
import '../styles/guidelinesModal.css';

interface GuidelinesModalProps {
  onAccept: () => void;
}

const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ onAccept }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true);
    }
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleAccept = () => {
    if (isChecked && hasScrolledToBottom) {
      localStorage.setItem('guidelinesAccepted', 'true');
      onAccept();
    }
  };

  return (
    <div className="guidelines-modal-overlay">
      <div className="guidelines-modal">
        <div className="guidelines-modal-header">
          <h2>CIT-U Forums Guidelines and Rules</h2>
        </div>
        <div className="guidelines-modal-content" onScroll={handleScroll}>
          <h3>Welcome to CIT-U Forums!</h3>
          <p>
            Before you start using our platform, please take a moment to read and understand 
            our community guidelines and rules. These guidelines are designed to ensure a 
            positive and productive experience for all members of the CIT-U community.
          </p>

          <h4>1. Respectful Communication</h4>
          <p>
            Always communicate with respect and courtesy. Disagreements are natural, but 
            personal attacks, harassment, or discriminatory language will not be tolerated.
          </p>

          <h4>2. Academic Integrity</h4>
          <p>
            While we encourage collaboration and knowledge sharing, do not use this platform 
            to cheat on assignments or exams. Content that promotes academic dishonesty may 
            be removed.
          </p>

          <h4>3. Appropriate Content</h4>
          <p>
            Do not post content that is illegal, obscene, or offensive. This includes but is not 
            limited to pornographic material, hate speech, and content that promotes violence.
          </p>

          <h4>4. Privacy and Confidentiality</h4>
          <p>
            Respect the privacy of others. Do not share personal information about other students, 
            faculty, or staff without their explicit permission.
          </p>

          <h4>5. Intellectual Property</h4>
          <p>
            Respect copyright and intellectual property rights. Give proper attribution when 
            sharing content created by others.
          </p>

          <h4>6. Spam and Commercial Activity</h4>
          <p>
            Do not use the forums for spam or unsolicited commercial activity. Promotional 
            content should be relevant to the CIT-U community and approved by moderators.
          </p>

          <h4>7. Reporting Violations</h4>
          <p>
            If you see content that violates these guidelines, please report it using the 
            reporting tools provided. Do not engage with or escalate conflicts.
          </p>

          <h4>8. Moderation and Enforcement</h4>
          <p>
            Moderators may remove content, issue warnings, or suspend accounts that violate 
            these guidelines. Serious or repeated violations may result in permanent account 
            termination.
          </p>

          <h4>9. Changes to Guidelines</h4>
          <p>
            These guidelines may be updated periodically. Users will be notified of significant 
            changes, but it is your responsibility to stay informed about the current rules.
          </p>

          <h4>10. Accountability</h4>
          <p>
            You are responsible for all content posted under your account. Sharing account 
            credentials is discouraged and does not absolve you of responsibility for actions 
            taken with your account.
          </p>

          <h3>By using CIT-U Forums, you agree to follow these guidelines and contribute positively to our community.</h3>
        </div>
        <div className="guidelines-modal-footer">
          <div className="checkbox-container">
            <input 
              type="checkbox" 
              id="accept-guidelines" 
              checked={isChecked} 
              onChange={handleCheckboxChange} 
              disabled={!hasScrolledToBottom}
            />
            <label htmlFor="accept-guidelines">
              I have read and agree to follow the CIT-U Forums Guidelines and Rules
              {!hasScrolledToBottom && <span className="scroll-notice"> (Please scroll to the bottom to enable)</span>}
            </label>
          </div>
          <button 
            className="accept-button" 
            onClick={handleAccept} 
            disabled={!isChecked || !hasScrolledToBottom}
          >
            Accept and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesModal;
