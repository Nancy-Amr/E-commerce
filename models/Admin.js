/*const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  userid: { 
        type: Number, 
        unique: true, 
       required: true,
    },
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePicture: {
    type: String,
    default: 'default-profile.png'
  },
  phoneNumbers: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^(\+\d{1,3})?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{4,9}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  }],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
// Pre-save hook to assign auto-incrementing userid
adminSchema.pre('save', async function(next) {
  if (this.isNew) {
      try {
          // Find the highest userid in the collection
          const lastUser = await mongoose.model('User').findOne()
              .sort({ userid: -1 }) // Sort by userid in descending order
              .select('userid');
          
          // Set userid: 1 for the first user, otherwise increment the highest userid
          this.userid = lastUser && lastUser.userid ? lastUser.userid + 1 : 1;
          next();
      } catch (error) {
          next(error);
      }
  } else {
      next();
}
});

// Pre-save hook to hash password before saving
adminSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema, 'admin')
*/