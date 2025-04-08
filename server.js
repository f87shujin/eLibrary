// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Import the User model
const Order = require('./models/Order'); // Ensure this path is correct
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000', 'https://f87shujin.github.io'], // Added GitHub Pages
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Added OPTIONS for preflight requests
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));
app.use(express.json()); // Parse JSON bodies

// Add a new endpoint for direct order creation without authentication
app.post('/api/public/orders', async (req, res) => {
    try {
        const { items, totalAmount, customerName } = req.body;
        
        // Create a simplified order without requiring authentication
        const order = new Order({
            userId: 'guest-user',
            userName: customerName || 'Guest User',
            items: items,
            totalAmount: totalAmount,
            status: 'completed'
        });

        await order.save();
        res.status(201).json({ 
            message: 'Order created successfully', 
            orderId: order._id 
        });
    } catch (error) {
        console.error('Error creating public order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

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

// API endpoint to update a book by IDY
app.put('/api/books/:id', async (req, res) => {
    const { id } = req.params; // Get the book ID from the request parameters
    const { name, price, description, image } = req.body; // Get the updated book details from the request body

    // Validate the input
    if (!name || !price || !description || !image) {Y
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Find the book by ID and update it
        const updatedBook = await Book.findByIdAndUpdate(
            id,
            { name, price, description, image },
            { new: true } // Return the updated document
        );

        if (!updatedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book updated successfully', book: updatedBook });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user without password hashing
        const user = new User({
            name,
            email,
            password // Store password directly without hashing
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        
        // Find user
        const user = await User.findOne({ email: trimmedEmail });
        if (!user) {
            console.log('User not found:', trimmedEmail);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Direct password comparison without hashing
        if (trimmedPassword !== user.password) {
            console.log('Password does not match for user:', trimmedEmail);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
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

        res.json({ 
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Middleware to check if the user is authenticated
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
        req.user = decoded; // Attach the decoded user info to the request
        next(); // Proceed to the next middleware or route handler
    });
};

// Example of a protected route
app.get('/api/admin', authenticateToken, (req, res) => {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
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
            updates.password = password;
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

// Cancel an order (admin only)
// Cancel an order (admin only)
app.put('/api/orders/:orderId/cancel', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        const { orderId } = req.params;
        
        // Find the order by _id or orderId
        let order = await Order.findById(orderId);
        
        // If not found by _id, try to find by orderId
        if (!order) {
            order = await Order.findOne({ orderId: orderId });
        }
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Update order status to cancelled
        order.status = 'cancelled';
        await order.save();
        
        res.json({ 
            message: 'Order cancelled successfully',
            order: {
                id: order._id,
                orderId: order.orderId || order._id,
                status: order.status
            }
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
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

// Add a direct database insertion endpoint
app.post('/api/db/insert', async (req, res) => {
    try {
        const { collection, document } = req.body;
        
        // Basic validation
        if (!collection || !document) {
            return res.status(400).json({ message: 'Collection name and document are required' });
        }
        
        // Only allow specific collections for security
        if (!['orders', 'feedback'].includes(collection)) {
            return res.status(403).json({ message: 'Not allowed to insert into this collection' });
        }
        
        let result;
        
        // Handle different collections
        if (collection === 'orders') {
            const order = new Order(document);
            result = await order.save();
        }
        // Add other collections as needed
        
        res.status(201).json({ 
            message: `Document inserted into ${collection} successfully`, 
            id: result._id 
        });
    } catch (error) {
        console.error(`Error inserting into ${req.body.collection}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// API endpoint to get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password from the response
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// API endpoint to delete a user by ID
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// API endpoint to delete a book by ID
app.delete('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBook = await Book.findByIdAndDelete(id);
        if (!deletedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add this new endpoint to delete an order
app.delete('/api/orders/:orderId', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const { orderId } = req.params;

        // Find the order by ID and delete it
        const deletedOrder = await Order.findOneAndDelete({ _id: orderId, userId: decoded.id });
        
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found or you do not have permission to delete this order' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add this new endpoint to get all orders (for admin)
app.get('/api/orders/all', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');

        // Check if the user is an admin (assuming you have a role field in your user model)
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const orders = await Order.find().sort({ orderDate: -1 }); // Fetch all orders
        res.json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});