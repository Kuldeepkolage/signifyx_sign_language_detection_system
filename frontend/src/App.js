
import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./Navbar";
import Login from "./Login";
import Register from "./Register";
import Camera from "./camera";
import Settings from "./Settings";
import History from "./History";
import Analytics from "./Analytics";
import Practice from "./Practice";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("login");
  const [activeTab, setActiveTab] = useState("camera");

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(savedUser));
      setCurrentView("main");
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentView("main");
  };

  const handleRegister = () => {
    setCurrentView("login");
  };

  const handleSwitchToRegister = () => {
    setCurrentView("register");
  };

  const handleSwitchToLogin = () => {
    setCurrentView("login");
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView("login");
    setActiveTab("camera");
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Render main app with tabs
  const renderMainContent = () => {
    switch(activeTab) {
      case "camera":
        return <Camera user={user} />;
      case "practice":
        return <Practice />;
      case "history":
        return <History />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />;
      default:
        return <Camera user={user} />;
    }
  };

  // Tab navigation buttons
  const renderTabs = () => {
    const tabs = [
      { id: "camera", label: "📹 Camera", icon: "📹" },
      { id: "practice", label: "📚 Practice", icon: "📚" },
      { id: "history", label: "📜 History", icon: "📜" },
      { id: "analytics", label: "📊 Analytics", icon: "📊" },
      { id: "settings", label: "⚙️ Settings", icon: "⚙️" },
    ];

    return (
      <div style={styles.tabNav}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabButton,
              ...(activeTab === tab.id ? styles.tabButtonActive : {})
            }}
          >
            <span style={styles.tabIcon}>{tab.icon}</span>
            <span style={styles.tabLabel}>{tab.label.split(" ")[1]}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="App">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="main-content">
        {currentView === "login" && !isLoggedIn && (
          <Login 
            onLogin={handleLogin} 
            onSwitchToRegister={handleSwitchToRegister} 
          />
        )}
        {currentView === "register" && !isLoggedIn && (
          <Register 
            onRegister={handleRegister} 
            onSwitchToLogin={handleSwitchToLogin} 
          />
        )}
        {currentView === "main" && isLoggedIn && (
          <div style={styles.mainContainer}>
            <div style={styles.welcomeSection}>
              <h2>Welcome, {user?.name}! 👋</h2>
              <p>Choose a feature to get started</p>
            </div>
            {renderTabs()}
            <div style={styles.contentArea}>
              {renderMainContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  mainContainer: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  welcomeSection: {
    textAlign: "center",
    marginBottom: "20px",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  tabNav: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },
  tabButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#ffffff",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "#64748b",
  },
  tabButtonActive: {
    backgroundColor: "#1e3a5f",
    borderColor: "#1e3a5f",
    color: "white",
  },
  tabIcon: {
    fontSize: "18px",
  },
  tabLabel: {
    fontSize: "14px",
  },
  contentArea: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
};

export default App;

