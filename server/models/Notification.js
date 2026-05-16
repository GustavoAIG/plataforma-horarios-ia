const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  Title: { type: String },
  Message: { type: String },
  Notification_Date: { type: Date },
  Status: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema, 'notifications');
