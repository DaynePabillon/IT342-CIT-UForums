import React from 'react';
import { useGuidelines } from '../context/GuidelinesContext';
import '../styles/footer.css';

const Footer: React.FC = () => {
  const { showGuidelines } = useGuidelines();

  const handleViewGuidelines = (e: React.MouseEvent) => {
    e.preventDefault();
    showGuidelines();
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>CIT-U Forums</h3>
            <p>A platform for the Cebu Institute of Technology University community to connect, share knowledge, and engage in meaningful discussions.</p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/forums">Forums</a></li>
              <li><a href="#" onClick={handleViewGuidelines}>Community Guidelines</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact</h3>
            <p>N. Bacalso Avenue, Cebu City</p>
            <p>Email: info@cit.edu</p>
            <p>Phone: (032) 261-7741</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CIT-U Forums. All rights reserved.</p>
          <p>
            <a href="#" onClick={handleViewGuidelines}>Terms of Use</a> | 
            <a href="#" onClick={handleViewGuidelines}>Privacy Policy</a> | 
            <a href="#" onClick={handleViewGuidelines}>Community Guidelines</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
