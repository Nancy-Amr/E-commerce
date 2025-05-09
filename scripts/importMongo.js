// scripts/importMongo.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const data = require('../products.json');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  await Product.deleteMany({});
  await Product.insertMany(data);
  console.log(`✅ Imported ${data.length} products`);
  mongoose.connection.close();
});
