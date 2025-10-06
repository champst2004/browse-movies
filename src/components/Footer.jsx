import React from "react";
import "../css/Footer.css"; 

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">Movie App</h3>
          <p>All your entertainment. One platform. Free forever.</p>
          <p className="footer-disclaimer">
            Movie App does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
          </p>
        </div>
        <div className="footer-section">
          <h4>Links</h4>
          <ul>
            <li><a href="mailto:championst2004@gmail.com">Contact Us</a></li>
            <li><a href="https://cst4.tech">About Us</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="footer-socials">
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-reddit"></i></a>
            <a href="#"><i className="fab fa-discord"></i></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2025 Movie App. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
