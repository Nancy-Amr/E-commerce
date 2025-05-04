const express = require("express");
const path = require("path"); // Correct import for path
const fs = require("fs"); // Correct import for fs
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRoute = require("./routes/products");

dotenv.config();
console.log("MONGODB_URI:", process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in .env file");
}

app.use(express.json());

const componentsPath = path.resolve(__dirname, "components");
console.log("Serving static files from:", componentsPath);
const htmlPathProducts = path.resolve(__dirname, "components/HTML/products.html");
const htmlPathTest = path.resolve(__dirname, "components/HTML/test.html");
console.log("Expected path for products.html:", htmlPathProducts);
console.log("Expected path for test.html:", htmlPathTest);
console.log("products.html exists:", fs.existsSync(htmlPathProducts));
console.log("test.html exists:", fs.existsSync(htmlPathTest));

// Log requests to static files
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, 'components/HTML')));
app.use(express.static(componentsPath));

app.use("/api/products", productRoute);

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