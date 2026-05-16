const express = require('express');

// Helper to create basic CRUD routes for a model
module.exports = function(model, options = {}) {
  const router = express.Router();
  const authMiddleware = options.authMiddleware;

  router.get('/', async (req, res) => {
    try {
      const items = await model.find();
      res.json(items);
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

  router.post('/', authMiddleware ? authMiddleware : async (req,res,next)=>{return next();}, async (req, res) => {
    try {
      const item = new model(req.body);
      await item.save();
      res.status(201).json(item);
    } catch (err) { res.status(400).json({ message: err.message }); }
  });

  router.get('/:id', async (req, res) => {
    try {
      const item = await model.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

  router.put('/:id', authMiddleware ? authMiddleware : async (req,res,next)=>{return next();}, async (req, res) => {
    try {
      const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    } catch (err) { res.status(400).json({ message: err.message }); }
  });

  router.delete('/:id', authMiddleware ? authMiddleware : async (req,res,next)=>{return next();}, async (req, res) => {
    try {
      await model.findByIdAndDelete(req.params.id);
      res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

  return router;
};
