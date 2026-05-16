const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  Name_Task: { type: String },
  Description_Task: { type: String },
  Creation_Date_Task: { type: Date },
  Due_Date_Task: { type: Date },
  Priority_Level_Task: { type: Number },
  Estimated_Hours: { type: Number },
  Status_Task: { type: String },
  Progress_Percentage: { type: Number },
  id_course: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseExtended' }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema, 'tasks');
