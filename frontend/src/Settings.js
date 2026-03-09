
import React, { useState, useEffect } from "react";

function Settings({ user, onUpdateUser, onLogout }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || "");
  const [profilePic, setProfilePic] = useState(user?.profilePic || "");
  const [preferences, setPreferences] = useState(user?.preferences || {
    language: "en",
    notifications: true,
    theme: "light",
    preferredSignLanguage: "asl"
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setDateOfBirth(user.dateOfBirth || "");
      setProfilePic(user.profilePic || "");
      setPreferences(user.preferences || {
        language: "en",
        notifications: true,
        theme: "light",
        preferredSignLanguage: "asl"
      });
    }
  }, [user]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          phone,
          dateOfBirth,
          profilePic,
          preferences
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(data.user));
        if (onUpdateUser) {
          onUpdateUser(data.user);
        }
      } else {
        setErrorMessage(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setErrorMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>⚙️ Settings</h2>
        <p style={styles.subtitle}>Manage your account and preferences</p>
      </div>

      {successMessage && (
        <div style={styles.successBox}>
          <span>✓</span> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div style={styles.errorBox}>
          <span>⚠️</span> {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Profile Picture */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Profile Picture</h3>
          <div style={styles.profileSection}>
            <div style={styles.profilePicPreview}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={styles.profilePicImage} />
              ) : (
                <span style={styles.profilePicPlaceholder}>👤</span>
              )}
            </div>
            <label style={styles.uploadButton}>
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                style={styles.profilePicInput}
              />
            </label>
          </div>
        </div>

        {/* Personal Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Personal Information</h3>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              style={{...styles.input, backgroundColor: "#f0f0f0", cursor: "not-allowed"}}
            />
            <small style={styles.helperText}>Email cannot be changed</small>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        {/* Preferences */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Preferences</h3>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Preferred Language</label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({...preferences, language: e.target.value})}
              style={styles.select}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Preferred Sign Language</label>
            <select
              value={preferences.preferredSignLanguage}
              onChange={(e) => setPreferences({...preferences, preferredSignLanguage: e.target.value})}
              style={styles.select}
            >
              <option value="asl">American Sign Language (ASL)</option>
              <option value="bsl">British Sign Language (BSL)</option>
              <option value="isl">Indian Sign Language (ISL)</option>
            </select>
          </div>

          <div style={styles.toggleGroup}>
            <label style={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                style={styles.toggle}
              />
              <span style={styles.toggleText}>Enable Notifications</span>
            </label>
          </div>

          <div style={styles.toggleGroup}>
            <label style={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={preferences.theme === "dark"}
                onChange={(e) => setPreferences({...preferences, theme: e.target.checked ? "dark" : "light"})}
                style={styles.toggle}
              />
              <span style={styles.toggleText}>Dark Mode</span>
            </label>
          </div>
        </div>

        <button type="submit" style={styles.saveButton} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Logout Button */}
      <div style={styles.logoutSection}>
        <button onClick={onLogout} style={styles.logoutButton}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
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
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#ecfdf5",
    color: "#059669",
    padding: "14px 18px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #a7f3d0",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "14px 18px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #fecaca",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  section: {
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "25px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "20px",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  profilePicPreview: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profilePicImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  profilePicPlaceholder: {
    fontSize: "36px",
  },
  uploadButton: {
    padding: "10px 20px",
    backgroundColor: "#1e3a5f",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  profilePicInput: {
    display: "none",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "18px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    backgroundColor: "#fff",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  helperText: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  toggleGroup: {
    marginBottom: "15px",
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  toggle: {
    width: "20px",
    height: "20px",
    cursor: "pointer",
  },
  toggleText: {
    fontSize: "14px",
    color: "#374151",
  },
  saveButton: {
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  logoutSection: {
    marginTop: "30px",
    paddingTop: "25px",
    borderTop: "1px solid #e2e8f0",
    textAlign: "center",
  },
  logoutButton: {
    padding: "12px 30px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    border: "2px solid #fecaca",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

export default Settings;

