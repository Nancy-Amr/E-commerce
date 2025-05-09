const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Processing', 'Shipped', 'Delivered', 'Canceled']
  },
  shippingAddress: {
    name: String,
    street: String,
    apartment: String,
    city: String,
    state: String,
    zip: String
  },
  products: [{
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  summary: {
    subtotal: Number,
    shipping: Number,
    tax: Number,
    total: Number
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema, 'Orders');





