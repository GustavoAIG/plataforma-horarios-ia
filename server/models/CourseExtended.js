const mongoose = require('mongoose');

const CourseExtendedSchema = new mongoose.Schema({
  Name_Course: { type: String },
  Hours_Course: { type: Number },
  Priority_Level_Course: { type: Number },
  Teacher_Course: { type: String },
  Times_A_Week_Course: { type: Number },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('CourseExtended', CourseExtendedSchema, 'courses');
