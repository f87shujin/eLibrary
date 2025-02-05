// server.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://f87study:admin1234@cluster0.fqatder.mongodb.net/eLibrary', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define a Book model
const Book = mongoose.model('Book', {
    name: String,
    price: Number,
    description: String,
    image: String
});

// Serve static files
app.use(express.static('public'));

// API endpoint to get books
app.get('/api/books', async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});