// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const bcrypt = require('bcrypt');
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
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
});

// User login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
    console.log('Login attempt:', req.body);
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