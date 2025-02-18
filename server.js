// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Import the User model
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
mongoose.connect('mongodb+srv://f87study:admin1234@cluster0.fqatder.mongodb.net/eLibrary')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a Book model
const Book = mongoose.model('Book', {
    name: String,
    price: Number,
    description: String,
    image: String
});


// Serve static files
app.use(express.static('public'));

// API endpoint to get books with optional search query
app.get('/api/books', async (req, res) => {
    const { search } = req.query; // Get the search query from the request
    try {
        const query = search ? { name: { $regex: search, $options: 'i' } } : {}; // Create a search query
        const books = await Book.find(query); // Find books based on the query
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create new user
        const user = new User({ name, email, password, role });
        await user.save();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Make sure role is included in the token
    const token = jwt.sign(
        { 
            id: user._id, 
            role: user.role  // Include the role in the token
        }, 
        'your_jwt_secret', 
        { expiresIn: '1h' }
    );
    
    res.json({ token });
});

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token' });
        if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
        req.userId = decoded.id;
        next();
    });
};

// Admin route
app.get('/api/admin', isAdmin, (req, res) => {
    res.json({ message: 'Welcome to the admin page!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});