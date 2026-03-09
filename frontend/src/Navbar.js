

import React, { useState, useEffect } from "react";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

 
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{
      ...styles.navbar,
      ...(isScrolled ? styles.navbarScrolled : {}),
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
      transition: 'all 0.5s ease'
    }}>
      <style>{keyframes}</style>
      <div style={styles.container}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <span style={styles.handEmoji}>🤟</span>
          </div>
          <h1 style={styles.brandName}>SignifyX</h1>
        </div>
        <div style={styles.tagline}>Sign Language Detection System</div>
      </div>
    </nav>
  );
}

const keyframes = `
  @keyframes logoFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: "16px 0",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(10px)",
  },
  navbarScrolled: {
    padding: "12px 0",
    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.4)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    animation: "logoFloat 2s ease-in-out infinite",
  },
  handEmoji: {
    fontSize: "26px",
  },
  brandName: {
    fontSize: "28px",
    fontWeight: "800",
    color: "white",
    margin: 0,
    letterSpacing: "1.5px",
    background: "linear-gradient(135deg, #fff 0%, #e0e0e0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  tagline: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "14px",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },
};

export default Navbar;


