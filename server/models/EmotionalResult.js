const mongoose = require('mongoose');

const EmotionalResultSchema = new mongoose.Schema({
  Stress_Level: { type: Number },
  Energy_Level: { type: Number },
  Motivation_Level: { type: Number },
  Mood_Result: { type: String },
  Notes_Result: { type: String },
  Evaluation_Date: { type: Date },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('EmotionalResult', EmotionalResultSchema, 'emotionalResults');
