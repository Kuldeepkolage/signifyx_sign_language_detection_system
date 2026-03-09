const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Test route
const PORT = 5000;
const JWT_SECRET = "signifyx_secret_key_2024"; // In production, use environment variable

// Middleware
app.use(cors());
app.use(express.json());

// User data file path
const usersFilePath = path.join(__dirname, "users.json");

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

// Register endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const users = readUsers();
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    // Save user
    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: "User registered successfully" });
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
      },
    });
  } catch (error) {
    console.error("Login error:", error);
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
  res.send("Backend working");
});

// Predict route
app.post("/predict", async (req, res) => {
  try {
    const { image } = req.body;

    const response = await axios.post("http://localhost:8000/predict", {
      image: image
    });

    res.json(response.data);

  } catch (error) {
    res.status(500).json({ error: "Prediction failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

