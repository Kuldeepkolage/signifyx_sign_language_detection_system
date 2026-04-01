
import React, { useState, useEffect } from "react";

function Practice() {
  const [signs, setSigns] = useState([]);
  const [language, setLanguage] = useState("asl");
  const [loading, setLoading] = useState(true);
  const [selectedSign, setSelectedSign] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    fetchSigns();
  }, [language]);

  const fetchSigns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/practice/signs?language=${language}`);
      const data = await response.json();
      if (response.ok) {
        setSigns(data.signs || []);
      }
    } catch (error) {
      console.error("Fetch signs error:", error);
    } finally {
      setLoading(false);
    }
  };

  const speakSign = (letter) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`The sign for ${letter}`);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getSignDescription = (letter) => {
    const descriptions = {
      A: "Make a fist with your thumb resting on the side of your index finger",
      B: "Hold your fingers straight up with your thumb crossing your palm",
      C: "Shape your hand like you're holding something curved",
      D: "Point your index finger up while keeping other fingers in a fist",
      E: "Touch your fingertips to your thumb base, fingers curved",
      F: "Show OK sign but with index finger and thumb touching at tips",
      G: "Point your index finger to the side, thumb out",
      H: "Point your index and middle fingers to the side, thumb out",
      I: "Make a fist with only your pinky finger up",
      J: "Trace a J shape in the air with your pinky",
      K: "Point up with index, spread middle finger, thumb between them",
      L: "Make an L shape with thumb and index finger",
      M: "Tuck your thumb under your first three fingers",
      N: "Tuck your thumb under your first two fingers",
      O: "Touch your fingertips to your thumb to make an O shape",
      P: "Make a K shape and point it downward",
      Q: "Make a G shape and point it downward",
      R: "Cross your middle finger over your index finger",
      S: "Make a fist with your thumb wrapped over your fingers",
      T: "Touch your thumb to the side of your index finger (not crossing)",
      U: "Hold both index and middle fingers straight up together",
      V: "Make a V shape with index and middle fingers",
      W: "Spread index, middle, and ring fingers up",
      X: "Hook your index finger",
      Y: "Extend thumb and pinky (like a phone call)",
      Z: "Trace a Z shape in the air with your index finger"
    };
    return descriptions[letter] || "Practice making this sign";
  };

  const languages = [
    { code: "asl", name: "American Sign Language (ASL)", flag: "🇺🇸" },
    { code: "bsl", name: "British Sign Language (BSL)", flag: "🇬🇧" },
    { code: "isl", name: "Indian Sign Language (ISL)", flag: "🇮🇳" }
  ];

  const handleNext = () => {
    if (currentIndex < signs.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedSign(signs[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedSign(signs[currentIndex - 1]);
    }
  };

  const handleSignClick = (sign, index) => {
    setSelectedSign(sign);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>📚</div>
        <p>Loading practice signs...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📚 Practice Mode</h2>
        <p style={styles.subtitle}>Learn sign language alphabet with step-by-step tutorials</p>
      </div>

      <div style={styles.languageSection}>
        <label style={styles.languageLabel}>Select Sign Language:</label>
        <div style={styles.languageButtons}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              style={{
                ...styles.languageButton,
                ...(language === lang.code ? styles.languageButtonActive : {})
              }}
            >
              <span style={styles.languageFlag}>{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.practiceArea}>
        <div style={styles.signDisplay}>
          <div style={styles.signCard}>
            <div style={styles.signEmoji}>🤟</div>
            <div style={styles.signLetter}>{selectedSign || signs[0] || "A"}</div>
            <div style={styles.signIndex}>
              {currentIndex + 1} of {signs.length}
            </div>
          </div>

          <div style={styles.controls}>
            <button onClick={handlePrev} disabled={currentIndex === 0} style={styles.navButton}>
              ◀️ Previous
            </button>
            <button 
              onClick={() => speakSign(selectedSign || signs[0])} 
              style={styles.speakButton}
            >
              🔊 Hear It
            </button>
            <button onClick={handleNext} disabled={currentIndex === signs.length - 1} style={styles.navButton}>
              Next ▶️
            </button>
          </div>
        </div>

        <div style={styles.tutorialSection}>
          <div style={styles.tutorialHeader}>
            <h3 style={styles.tutorialTitle}>📖 How to Sign</h3>
            <button 
              onClick={() => setShowTutorial(!showTutorial)}
              style={styles.tutorialToggle}
            >
              {showTutorial ? "Hide" : "Show"} Tutorial
            </button>
          </div>
          
          <div style={styles.descriptionBox}>
            <p style={styles.signDescription}>
              {getSignDescription(selectedSign || signs[0] || "A")}
            </p>
          </div>

          {showTutorial && (
            <div style={styles.tutorialContent}>
              <div style={styles.tutorialStep}>
                <span style={styles.stepNumber}>1</span>
                <span style={styles.stepText}>Position your hand clearly in front of the camera</span>
              </div>
              <div style={styles.tutorialStep}>
                <span style={styles.stepNumber}>2</span>
                <span style={styles.stepText}>Make the sign shown above</span>
              </div>
              <div style={styles.tutorialStep}>
                <span style={styles.stepNumber}>3</span>
                <span style={styles.stepText}>Use the live detection to check your form</span>
              </div>
              <div style={styles.tutorialStep}>
                <span style={styles.stepNumber}>4</span>
                <span style={styles.stepText}>Practice until you can sign it consistently</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={styles.allSignsSection}>
        <h3 style={styles.sectionTitle}>🔤 All Signs ({signs.length})</h3>
        <div style={styles.signsGrid}>
          {signs.map((sign, index) => (
            <button
              key={sign}
              onClick={() => handleSignClick(sign, index)}
              style={{
                ...styles.signButton,
                ...(selectedSign === sign || (!selectedSign && index === 0) ? styles.signButtonActive : {})
              }}
            >
              <span style={styles.signButtonEmoji}>🤟</span>
              <span style={styles.signButtonLetter}>{sign}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.tipsSection}>
        <h3 style={styles.sectionTitle}>💡 Practice Tips</h3>
        <div style={styles.tipsList}>
          <div style={styles.tipItem}>
            <span>💡</span> Practice in good lighting for better visibility
          </div>
          <div style={styles.tipItem}>
            <span>🎯</span> Keep your hand steady and in the camera frame
          </div>
          <div style={styles.tipItem}>
            <span>🔄</span> Practice each sign at least 10 times
          </div>
          <div style={styles.tipItem}>
            <span>⏰</span> Practice regularly for 15-20 minutes daily
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
    color: "#64748b",
  },
  spinner: {
    fontSize: "40px",
  },
  header: {
    marginBottom: "30px",
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  languageSection: {
    marginBottom: "30px",
    textAlign: "center",
  },
  languageLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "15px",
  },
  languageButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  languageButton: {
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#f8fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  languageButtonActive: {
    backgroundColor: "#1e3a5f",
    borderColor: "#1e3a5f",
    color: "white",
  },
  languageFlag: {
    fontSize: "20px",
  },
  practiceArea: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    marginBottom: "30px",
  },
  signDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  signCard: {
    width: "100%",
    padding: "40px",
    background: "linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)",
    borderRadius: "16px",
    textAlign: "center",
    color: "white",
  },
  signEmoji: {
    fontSize: "64px",
    marginBottom: "15px",
  },
  signLetter: {
    fontSize: "72px",
    fontWeight: "700",
    marginBottom: "10px",
  },
  signIndex: {
    fontSize: "14px",
    opacity: 0.8,
  },
  controls: {
    display: "flex",
    gap: "10px",
    width: "100%",
  },
  navButton: {
    flex: 1,
    padding: "12px",
    fontSize: "13px",
    fontWeight: "600",
    backgroundColor: "#f8fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  speakButton: {
    flex: 1,
    padding: "12px",
    fontSize: "13px",
    fontWeight: "600",
    backgroundColor: "#1e3a5f",
    color: "white",
    border: "2px solid #1e3a5f",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tutorialSection: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e2e8f0",
  },
  tutorialHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  tutorialTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  tutorialToggle: {
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: "#1e3a5f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  descriptionBox: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "15px",
    border: "1px solid #e2e8f0",
    marginBottom: "15px",
  },
  signDescription: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#374151",
    margin: 0,
  },
  tutorialContent: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  tutorialStep: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  stepNumber: {
    width: "24px",
    height: "24px",
    backgroundColor: "#1e3a5f",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    flexShrink: 0,
  },
  stepText: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.5",
  },
  allSignsSection: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "20px",
  },
  signsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(13, 1fr)",
    gap: "8px",
  },
  signButton: {
    padding: "12px 8px",
    backgroundColor: "#f8fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.2s ease",
  },
  signButtonActive: {
    backgroundColor: "#1e3a5f",
    borderColor: "#1e3a5f",
    color: "white",
  },
  signButtonEmoji: {
    fontSize: "18px",
  },
  signButtonLetter: {
    fontSize: "14px",
    fontWeight: "700",
  },
  tipsSection: {
    backgroundColor: "#ecfdf5",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #a7f3d0",
  },
  tipsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  tipItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    color: "#059669",
  },
};

export default Practice;

