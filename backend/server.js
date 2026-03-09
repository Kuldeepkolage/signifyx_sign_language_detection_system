
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;
const JWT_SECRET = "signifyx_secret_key_2024"; // In production, use environment variable

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// User data file path
const usersFilePath = path.join(__dirname, "users.json");
const historyFilePath = path.join(__dirname, "detection_history.json");

// Helper function to read users from file
const readUsers = () => {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading users file:", error);
  }
  return [];
};

// Helper function to write users to file
const writeUsers = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error);
  }
};

// Helper function to read detection history
const readHistory = () => {
  try {
    if (fs.existsSync(historyFilePath)) {
      const data = fs.readFileSync(historyFilePath, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading history file:", error);
  }
  return [];
};

// Helper function to write detection history
const writeHistory = (history) => {
  try {
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error("Error writing history file:", error);
  }
};

// Register endpoint (Enhanced with new fields)
app.post("/api/register", async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      dateOfBirth, 
      profilePic,
      preferences 
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const users = readUsers();
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with enhanced schema
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      dateOfBirth: dateOfBirth || "",
      profilePic: profilePic || "",
      preferences: preferences || {
        language: "en",
        notifications: true,
        theme: "light",
        preferredSignLanguage: "asl"
      },
      emailVerified: false,
      verificationToken: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save user
    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ 
      message: "User registered successfully",
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const users = readUsers();
    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        profilePic: user.profilePic || "",
        preferences: user.preferences || {
          language: "en",
          notifications: true,
          theme: "light",
          preferredSignLanguage: "asl"
        }
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile endpoint
app.put("/api/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { name, phone, dateOfBirth, profilePic, preferences } = req.body;

    const users = readUsers();
    const userIndex = users.findIndex((user) => user.id === decoded.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    if (name) users[userIndex].name = name;
    if (phone !== undefined) users[userIndex].phone = phone;
    if (dateOfBirth !== undefined) users[userIndex].dateOfBirth = dateOfBirth;
    if (profilePic !== undefined) users[userIndex].profilePic = profilePic;
    if (preferences) users[userIndex].preferences = { ...users[userIndex].preferences, ...preferences };
    users[userIndex].updatedAt = new Date().toISOString();

    writeUsers(users);

    res.json({ 
      message: "Profile updated successfully",
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        phone: users[userIndex].phone,
        dateOfBirth: users[userIndex].dateOfBirth,
        profilePic: users[userIndex].profilePic,
        preferences: users[userIndex].preferences
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Image upload for sign detection endpoint
app.post("/api/detect-image", async (req, res) => {
  try {
    const { image, userId } = req.body;
    
    // In a real implementation, this would process the image with a ML model
    // For now, we'll return a mock response
    // The actual implementation would use TensorFlow.js or call a Python model
    
    const mockPredictions = [
      { letter: "A", confidence: 0.95 },
      { letter: "B", confidence: 0.87 },
      { letter: "C", confidence: 0.82 }
    ];

    const detectedLetter = mockPredictions[0].letter;

    // Save to detection history if userId provided
    if (userId) {
      const history = readHistory();
      const newDetection = {
        id: uuidv4(),
        userId,
        type: "image",
        detectedSign: detectedLetter,
        confidence: mockPredictions[0].confidence,
        timestamp: new Date().toISOString()
      };
      history.push(newDetection);
      writeHistory(history);
    }

    res.json({
      success: true,
      predictions: mockPredictions,
      detectedSign: detectedLetter
    });
  } catch (error) {
    console.error("Image detection error:", error);
    res.status(500).json({ message: "Error processing image" });
  }
});

// Save detection result endpoint
app.post("/api/detection", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { detectedSign, confidence, type } = req.body;

    const history = readHistory();
    const newDetection = {
      id: uuidv4(),
      userId: decoded.id,
      type: type || "realtime",
      detectedSign,
      confidence: confidence || 0,
      timestamp: new Date().toISOString()
    };

    history.push(newDetection);
    writeHistory(history);

    res.status(201).json({ 
      message: "Detection saved",
      detection: newDetection
    });
  } catch (error) {
    console.error("Save detection error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get detection history endpoint
app.get("/api/history", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const history = readHistory();
    
    // Filter by userId
    const userHistory = history.filter(h => h.userId === decoded.id);

    // Get analytics
    const signCounts = {};
    userHistory.forEach(h => {
      signCounts[h.detectedSign] = (signCounts[h.detectedSign] || 0) + 1;
    });

    const totalDetections = userHistory.length;
    const avgConfidence = userHistory.length > 0 
      ? userHistory.reduce((sum, h) => sum + (h.confidence || 0), 0) / userHistory.length 
      : 0;

    res.json({
      history: userHistory.reverse(), // Most recent first
      analytics: {
        totalDetections,
        avgConfidence: (avgConfidence * 100).toFixed(1) + "%",
        signDistribution: signCounts,
        detectionsByType: {
          realtime: userHistory.filter(h => h.type === 'realtime').length,
          image: userHistory.filter(h => h.type === 'image').length
        }
      }
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete detection history entry
app.delete("/api/history/:id", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { id } = req.params;

    const history = readHistory();
    const filteredHistory = history.filter(h => h.id !== id || h.userId !== decoded.id);
    
    writeHistory(filteredHistory);

    res.json({ message: "History entry deleted" });
  } catch (error) {
    console.error("Delete history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get practice signs (tutorials)
app.get("/api/practice/signs", (req, res) => {
  try {
    const { language } = req.query;
    
    // Sign language alphabets
    const signs = {
      asl: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
      bsl: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
      isl: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    };

    const selectedLanguage = language || "asl";
    
    res.json({
      language: selectedLanguage,
      signs: signs[selectedLanguage] || signs.asl,
      totalSigns: (signs[selectedLanguage] || signs.asl).length
    });
  } catch (error) {
    console.error("Get practice signs error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify token endpoint
app.get("/api/verify", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

