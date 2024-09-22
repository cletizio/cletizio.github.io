const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const generateCertificate = require('../models/pdfGenerator');
const path = require('path');

const router = express.Router();

// Register user
router.post('/register', async(req, res) => {
    const { username, email, firstName, lastName, password } = req.body;

    try {
        const user = new User({ username, email, firstName, lastName, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Registration failed' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials'});
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h'});
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get user data
router.get('/profile', async (req, res) => {
    // Get JWT token from the request headers
    const authHeader = req.headers.authorization;

    // Check if the auth header is missing or incorrect.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized access, no token provided ' }); // Fixed syntax error here
    }

    const token = authHeader.split(' ')[1]; // Extract token from header

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Find user by ID
        const user = await User.findById(userId).select('-password'); // Excludes password from user data

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user); // Send user data to client
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
});
module.exports = router;