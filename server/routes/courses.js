const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Course = require('../models/Course');

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

router.get('/', async (req, res) => {
  const courses = await Course.find().populate('createdBy', 'email name');
  res.json(courses);
});

router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  const course = new Course({ title, description, createdBy: req.userId });
  await course.save();
  res.status(201).json(course);
});

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id).populate('createdBy', 'email name');
  if (!course) return res.status(404).json({ message: 'Not found' });
  res.json(course);
});

router.put('/:id', authMiddleware, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) return res.status(404).json({ message: 'Not found' });
  res.json(course);
});

router.delete('/:id', authMiddleware, async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
