import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema({
  user:                 { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Name_Course:          { type: String, required: true, trim: true },
  Hours_Course:         { type: Number, default: 3 },
  Priority_Level_Course:{ type: Number, default: 1, min: 1, max: 5 },
  Teacher_Course:       { type: String, default: '' },
  Times_A_Week_Course:  { type: Number, default: 2 },
  code:                 { type: String, default: '' },
}, { timestamps: true, collection: 'courses' })

export default mongoose.model('Course', courseSchema)