const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema({
  Session_Date: { type: Date },
  Start_Time: { type: String },
  End_Time: { type: String },
  Duration_Hours: { type: Number },
  Focus_Level: { type: Number },
  id_schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'StudySchedule' }
}, { timestamps: true });

module.exports = mongoose.model('StudySession', StudySessionSchema, 'studySessions');
