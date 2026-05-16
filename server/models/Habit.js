const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  Habit_Name: { type: String },
  Frequency_Per_Week: { type: Number },
  Habit_Status: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Habit', HabitSchema, 'habits');
