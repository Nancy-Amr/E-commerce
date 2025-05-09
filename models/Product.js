const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { 
    type: Number, 
    unique: true, 
  },
  brand: { 
    type: String, 
    required: false, // Allow null/missing brands
    default: "Unknown" // Optional: Fallback for missing brands
  },
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true, 
  },
  currency: { 
    type: String, 
    required: false, // Allow null/missing brands
    default: "EGP"
  },
  stock: { 
    type: Number, 
    required: false, 
    default: 0 
  },
  description: { 
    type: String, 
    required: false 
  },
  image_link: { 
    type: String, 
    required: true 
  },
  product_colors: { 
    type: [{
      hex_value: String,
      colour_name: String
    }],
    default: [] // Ensure empty arrays are valid
  },
  rating: { 
    type: Number, 
    required: false 
  },
  category: { 
    type: String, 
    required: false,
    default: "Unknown" 
  },
  product_type: { 
    type: String, 
    required: false 
  }
}, { 
//   timestamps: true,
//   collection: 'AllProducts'
}); 

module.exports = mongoose.model('Product', productSchema, 'AllProducts');