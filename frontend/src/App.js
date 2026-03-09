import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./Navbar";
import Login from "./Login";
import Register from "./Register";
import Camera from "./camera";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("login");

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(savedUser));
      setCurrentView("camera");
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentView("camera");
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
  };

  return (
    <div className="App">
      <Navbar />
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
        {currentView === "camera" && isLoggedIn && (
          <div className="camera-container">
            {user && <h3>Welcome, {user.name}!</h3>}
            <Camera />
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
