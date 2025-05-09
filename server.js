const express = require("express");
const path = require("path"); 
const fs = require("fs"); 
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRoute = require("./routes/products");
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');  
const feedbackRoutes = require('./routes/feedback');
const orderRoutes = require('./routes/order');
const cors = require('cors');
const cartRoutes = require('./routes/Cart'); // Add this line


dotenv.config();
console.log("MONGODB_URI:", process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in .env file");
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5000', 
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/products", productRoute);
app.use('/api/user', userRoutes);  
app.use('/api/feedback', feedbackRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/Cart', cartRoutes); // Add this line


const componentsPath = path.resolve(__dirname, "components");
console.log("Serving static files from:", componentsPath);
const htmlPathProducts = path.resolve(__dirname, "components/HTML/products.html");
const htmlPathTest = path.resolve(__dirname, "components/HTML/test.html");
const htmlPathSignup = path.resolve(__dirname, "components/HTML/signup.html");
const htmlpathFeedback = path.resolve(__dirname, "components/HTML/feedback.html");
const htmlPathOrder = path.resolve(__dirname, "components/HTML/order.html");
const htmlPathCart = path.resolve(__dirname, "components/HTML/cart.html");
const htmlPathFedAdmin = path.resolve(__dirname, "components/HTML/feedback_admin.html");
const htmlPathProductManage = path.resolve(__dirname, "components/HTML/productmanage.html");

console.log("Expected path for products.html:", htmlPathProducts);
console.log("Expected path for test.html:", htmlPathTest);
console.log("products.html exists:", fs.existsSync(htmlPathProducts));
console.log("signin.html exists:", fs.existsSync(htmlPathSignup));
console.log("feedback.html exists:", fs.existsSync(htmlpathFeedback));
console.log("order.html exists:", fs.existsSync(htmlPathOrder));
console.log("cart.html exists:", fs.existsSync(htmlPathCart));
console.log("feedback_admin.html exists:", fs.existsSync(htmlPathFedAdmin));
console.log("productmanage.html exists:", fs.existsSync(htmlPathProductManage));


// Log requests to static files
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, 'components/HTML')));
app.use(express.static(componentsPath));

app.get('/signup.html', (req, res) => {
  const signinPath = path.join(__dirname, 'components/HTML/signup.html');
  if (fs.existsSync(signinPath)) {
    res.sendFile(signinPath);
  } else {
    res.status(404).json({ error: "signin.html not found" });
  }
});

app.get('/feedback.html', (req, res) => {
  const htmlpathFeedback = path.join(__dirname, 'components/HTML/feedback.html');
  if (fs.existsSync(htmlpathFeedback)) {
    res.sendFile(htmlpathFeedback);
  } else {
    res.status(404).json({ error: "feedback.html not found" });
  }
});

app.get('/order.html', (req, res) => {
  const htmlPathOrder = path.join(__dirname, 'components/HTML/order.html');
  if (fs.existsSync(htmlPathOrder)) {
    res.sendFile(htmlPathOrder);
  } else {
    res.status(404).json({ error: "order.html not found" });
  }
});

app.get('/cart.html', (req, res) => {
  const htmlPathCart = path.join(__dirname, 'components/HTML/cart.html');
  if (fs.existsSync(htmlPathCart)) {
    res.sendFile(htmlPathCart);
  } else {
    res.status(404).json({ error: "cart.html not found" });
  }
});

app.get('/feedback_admin.html', (req, res) => {
  const adminFeedbackPath = path.join(__dirname, 'components/HTML/feedback_admin.html');
  if (fs.existsSync(adminFeedbackPath)) {
    res.sendFile(adminFeedbackPath);
  } else {
    res.status(404).json({ error: "feedback_admin.html not found" });
  }
});


app.use((req, res) => {
  res.status(404).json({ error: "Resource not found" });
});



mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("DB connection is successful"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}!`);
});