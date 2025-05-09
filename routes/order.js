const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const validateOrderInput = require('../middleware/validateOrderInput');
const { protect } = require('../middleware/auth');

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Create an order
router.post('/', protect, validateOrderInput, async (req, res) => {
  try {
    const { orderId, orderDate, status, shippingAddress, products, summary } = req.body;
    const newOrder = new Order({
      orderId,
      orderDate,
      status,
      shippingAddress,
      products,
      summary,
      user: req.user._id
    });
    const savedOrder = await newOrder.save();

    // Add order to user's orders array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { orders: savedOrder._id }
    });

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Read all orders for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('user', 'fullname email');
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Read a single order by orderId
router.get('/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, user: req.user._id })
      .populate('user', 'fullname email');
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update an order
router.put('/:orderId', protect, validateOrderInput, async (req, res) => {
  try {
    const { orderId, orderDate, status, shippingAddress, products, summary } = req.body;
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: req.params.orderId, user: req.user._id },
      { orderId, orderDate, status, shippingAddress, products, summary, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an order
router.delete('/:orderId', protect, async (req, res) => {
  try {
    const deletedOrder = await Order.findOneAndDelete({ orderId: req.params.orderId, user: req.user._id });
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Remove order from user's orders array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { orders: deletedOrder._id }
    });

    res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;