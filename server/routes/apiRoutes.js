const express = require('express');
const router = express.Router();

const generic = require('./generic');
const { requireAuth } = require('../middlewares/auth');

const AiRecommendation = require('../models/AiRecommendation');
const CourseExtended = require('../models/CourseExtended');
const EmotionalResult = require('../models/EmotionalResult');
const Habit = require('../models/Habit');
const Notification = require('../models/Notification');
const PerformanceMetric = require('../models/PerformanceMetric');
const ProgressTracking = require('../models/ProgressTracking');
const StudyMethod = require('../models/StudyMethod');
const StudySchedule = require('../models/StudySchedule');
const StudySession = require('../models/StudySession');
const Task = require('../models/Task');
const User = require('../models/User');

// public read for courses and studyMethods
router.use('/coursesExt', generic(CourseExtended));
router.use('/studyMethods', generic(StudyMethod));

// protected write operations for the rest
router.use('/aiRecommendations', generic(AiRecommendation, { authMiddleware: requireAuth }));
router.use('/emotionalResults', generic(EmotionalResult, { authMiddleware: requireAuth }));
router.use('/habits', generic(Habit, { authMiddleware: requireAuth }));
router.use('/notifications', generic(Notification, { authMiddleware: requireAuth }));
router.use('/performanceMetrics', generic(PerformanceMetric, { authMiddleware: requireAuth }));
router.use('/progressTracking', generic(ProgressTracking, { authMiddleware: requireAuth }));
router.use('/studySchedules', generic(StudySchedule, { authMiddleware: requireAuth }));
router.use('/studySessions', generic(StudySession, { authMiddleware: requireAuth }));
router.use('/tasks', generic(Task, { authMiddleware: requireAuth }));
router.use('/users', generic(User, { authMiddleware: requireAuth }));

module.exports = router;
