const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  Age_User: { type: Number },
  Career_User: { type: String },
  Courses_User: { type: Number },
  Email_User: { type: String, required: true, unique: true },
  Role: { type: String, enum: ['user','admin','teacher'], default: 'user' },
  Last_Name_User_1: { type: String },
  Last_name_User_2: { type: String },
  Name_User: { type: String },
  Password_user: { type: String, required: true },
  Registration_Date: { type: Date, default: Date.now },
  Study_Goal_Student: { type: String },
  University_User: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema, 'users');
