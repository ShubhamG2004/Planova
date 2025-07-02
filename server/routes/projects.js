// server/routes/project.js
const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create Project
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, members = [] } = req.body;
    const project = await Project.create({
      title,
      description,
      createdBy: req.user.id,
      members: [...members, req.user.id]
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to create project' });
  }
});

// Get all projects user is part of
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user.id }).populate('members', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch projects' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, members } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { title, description, members },
      { new: true }
    );
    if (!project) return res.status(403).json({ msg: 'Unauthorized or not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Project.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!deleted) return res.status(403).json({ msg: 'Unauthorized or not found' });
    res.json({ msg: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete project' });
  }
});

module.exports = router;
