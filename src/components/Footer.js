import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <h3 className="footer-brand">BusFlow</h3>
            <p className="footer-tagline">Your Complete Bus Journey Solution</p>
            <p className="footer-text">Smart Transit for Everyone</p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><button onClick={() => navigate('/')}>Home</button></li>
              <li><button onClick={() => navigate('/journey-planner')}>Journey Planner</button></li>
              <li><button onClick={() => navigate('/track-bus')}>Track Bus</button></li>
              <li><button onClick={() => navigate('/search-route')}>Search Route</button></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><button onClick={() => navigate('/user-guide')}>User Guide</button></li>
              <li><button onClick={() => navigate('/helpline')}>Helpline</button></li>
              <li><button onClick={() => navigate('/feedback')}>Feedback</button></li>
              <li><button onClick={() => navigate('/fare-calculator')}>Fare Calculator</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4 className="footer-heading">Contact</h4>
            <div className="footer-contact">
              <p><i className="fas fa-phone"></i> BMTC: 1800-425-1663</p>
              <p><i className="fas fa-envelope"></i> support@busflow.com</p>
              <p><i className="fas fa-map-marker-alt"></i> Bangalore, Karnataka</p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="footer-social">
          <a href="#" className="social-link" aria-label="Facebook">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" className="social-link" aria-label="Twitter">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="social-link" aria-label="Instagram">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="#" className="social-link" aria-label="LinkedIn">
            <i className="fab fa-linkedin-in"></i>
          </a>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-copyright">
            <p>© {currentYear} BusFlow. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#privacy">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="#terms">Terms of Service</a>
              <span className="separator">•</span>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
          <p className="footer-credits">
            Made with <i className="fas fa-heart"></i> for Bangalore commuters
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
