import React, { useState } from "react";

function Register({ onRegister, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!name) {
      newErrors.name = "Full name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setApiError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Register error:", error);
      setApiError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftSection}>
        <div style={styles.brandContent}>
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>🤟</div>
            <h1 style={styles.brandName}>SignifyX</h1>
          </div>
          
          <h2 style={styles.mainTitle}>
            Sign Language Detection & Recognition System
          </h2>
          
          <p style={styles.description}>
            SignifyX is an intelligent web-based system developed to recognize and interpret 
            sign language gestures using computer vision and machine learning techniques. 
            The main aim of this project is to bridge the communication gap between 
            hearing-impaired individuals who use sign language and people who are not familiar with it.
          </p>
          
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📹</div>
              <h3 style={styles.featureTitle}>Live Detection</h3>
              <p style={styles.featureDesc}>Real-time hand gesture recognition through webcam</p>
            </div>
            
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🖼️</div>
              <h3 style={styles.featureTitle}>Image Upload</h3>
              <p style={styles.featureDesc}>Upload images for gesture prediction</p>
            </div>
            
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📊</div>
              <h3 style={styles.featureTitle}>Analytics</h3>
              <p style={styles.featureDesc}>View detection history and statistics</p>
            </div>
            
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🔊</div>
              <h3 style={styles.featureTitle}>Text & Voice</h3>
              <p style={styles.featureDesc}>Convert gestures to text and speech output</p>
            </div>
          </div>
          
          <div style={styles.missionSection}>
            <h3 style={styles.missionTitle}>🌟 Our Mission</h3>
            <p style={styles.missionText}>
              To create a more inclusive environment by enabling automatic recognition of 
              sign language gestures and converting them into understandable text for 
              wider communication accessibility.
            </p>
          </div>
        </div>
      </div>
      
      <div style={styles.rightSection}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Join SignifyX and start exploring</p>
          </div>
          
          {apiError && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠️</span>
              {apiError}
            </div>
          )}
          
          {successMessage && (
            <div style={styles.successBox}>
              <span style={styles.successIcon}>✓</span>
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your full name"
                style={{
                  ...styles.input,
                  ...(focusedField === 'name' ? styles.inputFocused : {}),
                  ...(errors.name ? styles.inputError : {})
                }}
                disabled={loading}
              />
              {errors.name && <span style={styles.errorText}>{errors.name}</span>}
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your email"
                style={{
                  ...styles.input,
                  ...(focusedField === 'email' ? styles.inputFocused : {}),
                  ...(errors.email ? styles.inputError : {})
                }}
                disabled={loading}
              />
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Create a password"
                style={{
                  ...styles.input,
                  ...(focusedField === 'password' ? styles.inputFocused : {}),
                  ...(errors.password ? styles.inputError : {})
                }}
                disabled={loading}
              />
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="Confirm your password"
                style={{
                  ...styles.input,
                  ...(focusedField === 'confirmPassword' ? styles.inputFocused : {}),
                  ...(errors.confirmPassword ? styles.inputError : {})
                }}
                disabled={loading}
              />
              {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
            </div>
            
            <button 
              type="submit" 
              style={styles.button}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account?{" "}
              <span 
                onClick={onSwitchToLogin} 
                style={styles.link}
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "calc(100vh - 80px)",
    backgroundColor: "#f8fafc",
  },
  leftSection: {
    flex: 1.2,
    background: "linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)",
    padding: "50px",
    display: "flex",
    alignItems: "center",
    overflowY: "auto",
  },
  brandContent: {
    maxWidth: "600px",
    color: "white",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "35px",
  },
  logoIcon: {
    fontSize: "42px",
  },
  brandName: {
    fontSize: "32px",
    fontWeight: "800",
    margin: 0,
    letterSpacing: "1px",
  },
  mainTitle: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "20px",
    lineHeight: "1.3",
    color: "#ffffff",
  },
  description: {
    fontSize: "15px",
    lineHeight: "1.7",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: "30px",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
    marginBottom: "30px",
  },
  featureCard: {
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    padding: "18px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  featureIcon: {
    fontSize: "24px",
    marginBottom: "8px",
  },
  featureTitle: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "4px",
    color: "#ffffff",
  },
  featureDesc: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.7)",
    margin: 0,
  },
  missionSection: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  missionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#fbbf24",
  },
  missionText: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "rgba(255, 255, 255, 0.8)",
    margin: 0,
  },
  rightSection: {
    flex: 0.8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    backgroundColor: "#ffffff",
  },
  formCard: {
    width: "100%",
    maxWidth: "400px",
  },
  formHeader: {
    marginBottom: "30px",
    textAlign: "center",
  },
  formTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  formSubtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "14px 18px",
    borderRadius: "10px",
    marginBottom: "24px",
    fontSize: "14px",
    border: "1px solid #fecaca",
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#ecfdf5",
    color: "#059669",
    padding: "14px 18px",
    borderRadius: "10px",
    marginBottom: "24px",
    fontSize: "14px",
    border: "1px solid #a7f3d0",
  },
  errorIcon: {
    fontSize: "18px",
  },
  successIcon: {
    fontSize: "18px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: "15px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
  },
  inputFocused: {
    borderColor: "#1e3a5f",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 0 3px rgba(30, 58, 95, 0.1)",
  },
  inputError: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    color: "#dc2626",
    fontSize: "13px",
  },
  button: {
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
  },
  footer: {
    textAlign: "center",
    marginTop: "28px",
  },
  footerText: {
    color: "#64748b",
    fontSize: "14px",
    margin: 0,
  },
  link: {
    color: "#1e3a5f",
    cursor: "pointer",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Register;

