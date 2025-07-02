const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }]
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user.id
    }).populate('members.user', 'name email');

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private (project members only)
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      'members.user': req.user.id
    })
      .populate('members.user', 'name email')
      .populate('tasks')
      .populate('sprints');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (admin/pm only)
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      'members.user': req.user.id,
      'members.role': { $in: ['admin', 'project_manager'] }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    Object.assign(project, req.body);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (admin/pm only)
router.post('/:id/members', protect, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      'members.user': req.user.id,
      'members.role': { $in: ['admin', 'project_manager'] }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    project.members.push(req.body);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @desc    Remove project
// @route   DELETE /api/projects/:id
// @access  Private (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      'members.user': req.user.id,
      'members.role': 'admin'
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    res.json({ message: 'Project removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;