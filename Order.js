const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    items: [{
        name: String,
        price: Number,
        quantity: Number,
        type: String, // 'purchase' or 'rental'
        rentalDays: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'completed'
    }
});

module.exports = mongoose.model('Order', OrderSchema); 