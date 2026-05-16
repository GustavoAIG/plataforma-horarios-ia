const mongoose = require('mongoose');

const StudyScheduleSchema = new mongoose.Schema({
  Date_Schedule: { type: Date },
  Start_Time_Schedule: { type: String },
  End_Time_Schedule: { type: String },
  Break_Time: { type: Number },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('StudySchedule', StudyScheduleSchema, 'studySchedules');
