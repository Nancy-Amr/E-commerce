const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    FullName: String,
    Email: String,
    Rating: Number,
    Feedback: String
});

module.exports = mongoose.model('Feedback', feedbackSchema);