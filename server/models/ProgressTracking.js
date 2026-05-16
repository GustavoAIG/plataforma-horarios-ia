const mongoose = require('mongoose');

const ProgressTrackingSchema = new mongoose.Schema({
  Completed_Tasks: { type: Number },
  Study_Hours: { type: Number },
  Productivity_Level: { type: Number },
  Weekly_Progress: { type: Number },
  Monthly_Progress: { type: Number },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ProgressTracking', ProgressTrackingSchema, 'progressTracking');
