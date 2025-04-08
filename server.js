// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Import the User model
const bcrypt = require('bcrypt');
const Order = require('./models/Order');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000'], // Allow your Python server
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));
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
// Add this API endpoint to add a new book
app.post('/api/addbooks', async (req, res) => {
    const { name, price, description, image } = req.body;

    // Validate the input
    if (!name || !price || !description || !image) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newBook = new Book({
            name,
            price,
            description,
            image
        });

        await newBook.save(); // Save the new book to the database
        res.status(201).json({ message: 'Book added successfully', book: newBook });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// API endpoint to get books with optional search query
app.get('/api/books', async (req, res) => {
    const { search, sort, category } = req.query;
    try {
        let query = {};
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        if (category && category !== 'all') {
            query.category = category;
        }

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

        const books = await Book.find(query)
            .select('name price description image category') // Select specific fields
            .sort(sortObj);
        
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

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10); // Hashing with 10 salt rounds
        const user = new User({ name, email, password: hashedPassword, role });
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

    // Compare the plain text password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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

// Add this new endpoint
app.post('/api/orders', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const { items, totalAmount } = req.body;

        const order = new Order({
            userId: decoded.id,
            userName: decoded.name,
            items: items,
            totalAmount: totalAmount
        });

        await order.save();
        res.status(201).json({ 
            message: 'Order created successfully', 
            orderId: order._id 
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add endpoint to get user's orders
app.get('/api/orders', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const orders = await Order.find({ userId: decoded.id }).sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add this new endpoint to get a specific order
app.get('/api/orders/:orderId', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const order = await Order.findOne({ 
            _id: req.params.orderId,
            userId: decoded.id 
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});