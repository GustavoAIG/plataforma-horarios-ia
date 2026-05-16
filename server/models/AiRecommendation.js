const mongoose = require('mongoose');

const AiRecommendationSchema = new mongoose.Schema({
  Recommendation_Type_AI: { type: String },
  Recommendation_Text_AI: { type: String },
  Generated_Date_AI: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('AiRecommendation', AiRecommendationSchema, 'aiRecommendations');
