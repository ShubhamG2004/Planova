const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const Task = require('../models/Task');

// ✅ POST /api/projects — Create project
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, tags, roadmap, members } = req.body;

    // Validate title
    if (!title || title.trim().length < 3) {
      return res.status(400).json({ message: 'Project title is required and must be at least 3 characters.' });
    }

    // Resolve members (emails → user _id)
    let memberIds = [];

    if (Array.isArray(members) && members.length > 0) {
      const foundUsers = await User.find({ email: { $in: members } }, '_id');
      memberIds = foundUsers.map(user => user._id);
    }

    const project = await Project.create({
      title: title.trim(),
      description: description?.trim() || '',
      status: status || 'active',
      tags: tags || [],
      roadmap: roadmap || [],
      createdBy: req.user._id,
      members: memberIds,
    });

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(400).json({ message: err.message || 'Failed to create project' });
  }
});

// ✅ GET /api/projects — Get all user’s projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id },
      ],
    })
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET /api/projects/:id — Get single project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .populate('tasks');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(m => m._id.equals(req.user._id)) ||
                     project.createdBy._id.equals(req.user._id);
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ PUT /api/projects/:id — Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the creator can update this project' });
    }

    const { title, description, status, tags, roadmap } = req.body;

    if (title && title.trim().length >= 3) project.title = title.trim();
    if (description !== undefined) project.description = description.trim();
    if (status) project.status = status;
    if (tags) project.tags = tags;
    if (roadmap) project.roadmap = roadmap;

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ DELETE /api/projects/:id — Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the creator can delete this project' });
    }

    await project.remove();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
