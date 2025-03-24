// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Import the User model
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors()); // Enable CORS for all routes
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
    const { search, sort, category } = req.query;
    try {
        let query = {};
        
        // Add search filter if provided
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        // Add category filter if provided
        if (category && category !== 'all') {
            query.category = category;
        }

        // Build sort object
        let sortObj = {};
        if (sort) {
            switch (sort) {
                case 'price-asc':
                    sortObj = { price: 1 };
                    break;
                case 'price-desc':
                    sortObj = { price: -1 };
                    break;
                case 'name-asc':
                    sortObj = { name: 1 };
                    break;
                case 'name-desc':
                    sortObj = { name: -1 };
                    break;
            }
        }

        const books = await Book.find(query).sort(sortObj);
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// API endpoint to get a single book by ID
app.get('/api/books/:id', async (req, res) => {
    const { id } = req.params; // Get the book ID from the request parameters
    try {
        const book = await Book.findById(id); // Find the book by ID
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book); // Return the book details
    } catch (error) {
        console.error('Error fetching book:', error);
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

        // Create new user without hashing the password
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
        console.log('User not found:', email); // Log if user is not found
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the plain text password directly
    if (password !== user.password) {
        console.log('Password does not match for user:', email); // Log if password does not match
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a token with name, email, and role
    const token = jwt.sign(
        { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role  
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

// Update user profile
app.put('/api/updateProfile', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, 'your_jwt_secret', async (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token' });

        const { name, email, password } = req.body;
        const updates = { name, email };

        // Only update password if provided
        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        try {
            await User.findByIdAndUpdate(decoded.id, updates);
            res.json({ message: 'Profile updated successfully' });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
});

// API endpoint to get user details
app.get('/api/user', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, 'your_jwt_secret', async (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token' });

        try {
            const user = await User.findById(decoded.id).select('-password'); // Exclude password from the response
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user); // Return user details
        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});