const mongoose = require('mongoose');

const PerformanceMetricSchema = new mongoose.Schema({
  Concentration_Level: { type: Number },
  Efficiency_Level: { type: Number },
  Study_Consistency: { type: Number },
  Academic_Performance: { type: Number },
  Metric_Date: { type: Date },
  id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PerformanceMetric', PerformanceMetricSchema, 'performanceMetrics');
