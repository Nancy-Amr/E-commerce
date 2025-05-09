const validateOrderInput = (req, res, next) => {
    const { orderId, orderDate, status, shippingAddress, products, summary } = req.body;
    if (!orderId || !orderDate || !status || !shippingAddress || !products || !summary) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!['Processing', 'Shipped', 'Delivered', 'Canceled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be Processing, Shipped, Delivered, or Canceled.' });
    }
    if (!products.length) {
      return res.status(400).json({ error: 'At least one product is required.' });
    }
    next();
  };
  
  module.exports = validateOrderInput;