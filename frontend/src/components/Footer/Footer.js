import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-premium">
      <div className="container footer-grid">
        <div className="footer-brand-section">
          <div className="footer-logo">
            <span className="icon">🩸</span>
            <span className="text">Vital<span>Flow</span></span>
          </div>
          <p className="footer-tagline">Empowering life through seamless blood donation management. Join our network of heroes today.</p>
          <div className="social-links">
            <span className="social-icon">🔵</span>
            <span className="social-icon">📸</span>
            <span className="social-icon">🐦</span>
          </div>
        </div>
        
        <div className="footer-links-section">
          <h4>Platform</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/hospitals">Hospital Network</a></li>
            <li><a href="/blood-camps">Donation Camps</a></li>
            <li><a href="/emergency-requests">Emergency Portal</a></li>
          </ul>
        </div>

        <div className="footer-links-section">
          <h4>Support</h4>
          <ul>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/admin-login" className="footer-admin-link">Admin Access</a></li>
          </ul>
        </div>

        <div className="footer-contact-section">
          <h4>Get in Touch</h4>
          <p><span>📍</span> 123 Health Ave, Colombo 07</p>
          <p><span>📞</span> +94 11 234 5678</p>
          <p><span>✉️</span> support@vitalflow.lk</p>
        </div>
      </div>

      <div className="footer-bottom-premium">
        <div className="container">
          <p>&copy; {currentYear} VitalFlow Blood System. Built with ❤️ for humanity.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
