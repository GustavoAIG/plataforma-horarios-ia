import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  Name_User:            { type: String, required: true, trim: true },
  Last_Name_User_1:     { type: String, required: true, trim: true },
  Last_name_User_2:     { type: String, default: '' },
  Email_User:           { type: String, required: true, unique: true, lowercase: true },
  Password_user:        { type: String, required: true, minlength: 6 },
  Age_User:             { type: Number },
  Career_User:          { type: String, default: '' },
  University_User:      { type: String, default: '' },
  Courses_User:         { type: Number, default: 0 },
  Study_Goal_Student:   { type: String, default: '' },
  Registration_Date:    { type: Date, default: Date.now },
  role:                 { type: String, enum: ['student', 'admin'], default: 'student' },
  learningAnswers:      { type: [String], default: [] },
  hasCompletedOnboarding: { type: Boolean, default: false },  // ← agregar
  onboardingCourses:    { type: [String], default: [] },      // ← agregar
  // Window of calendar projection for the student
  semesterWeeks:        { type: Number, default: 16, min: 1, max: 52 },
  semesterStartDate:    { type: Date, default: null },
}, { timestamps: true, collection: 'users' })

// ← El problema estaba aquí, async/await en vez de callback
userSchema.pre('save', async function () {
  if (!this.isModified('Password_user')) return
  this.Password_user = await bcrypt.hash(this.Password_user, 12)
})

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.Password_user)
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.Password_user
  delete obj.__v
  return obj
}

export default mongoose.model('User', userSchema)