const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback'); // Ensure this path is correct

// Verify the model is properly imported
if (typeof Feedback !== 'function') {
  throw new Error('Feedback is not a constructor - check model import');
}

router.use(express.json());

const validateFeedbackInput = (req, res, next) => {
    const { FullName, Feedback, Rating, Email } = req.body;
    if (!FullName || !Feedback || !Rating || !Email) {
        return res.status(400).json({ error: "All fields are required." });
    }
    if (!Number.isInteger(Number(Rating)) || Rating < 1 || Rating > 5) {
        return res.status(400).json({ error: "Rating must be 1-5." });
    }
    next();
};

router.post('/', validateFeedbackInput, async (req, res) => {
    try {
      const newFeedback = new Feedback({
        FullName: req.body.FullName,
        Email: req.body.Email,
        Rating: req.body.Rating,
        Feedback: req.body.Feedback
      });
      
      const savedFeedback = await newFeedback.save();
      res.status(201).json(savedFeedback);
    } catch (error) {
      console.error("Error saving feedback:", error);
      res.status(500).json({ error: error.message });
    }
});

// Add this to your existing feedback.js router file
router.get('/', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 }); // Get all feedback, newest first
        res.json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ error: "Failed to fetch feedback" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!deletedFeedback) {
            return res.status(404).json({ error: "Feedback not found" });
        }
        res.json({ message: "Feedback deleted successfully" });
    } catch (error) {
        console.error("Error deleting feedback:", error);
        res.status(500).json({ error: "Failed to delete feedback" });
    }
});

module.exports = router;