const mongoose = require('mongoose');

const StudyMethodSchema = new mongoose.Schema({
  Name_Method: { type: String },
  Description_Method: { type: String },
  Scientific_Evidence: { type: String },
  Difficulty_Level: { type: Number },
  id_ai: { type: mongoose.Schema.Types.ObjectId, ref: 'AiRecommendation' }
}, { timestamps: true });

module.exports = mongoose.model('StudyMethod', StudyMethodSchema, 'studyMethods');
