const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const ProjectInvitation = require('../models/Invite');


// POST /api/projects — Create new project
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      status = 'active',
      tags = [],
      roadmap = [],
      members = [],
      startDate,
      targetDate
    } = req.body;

    // Validate title
    if (!title || title.trim().length < 3) {
      return res.status(400).json({ message: 'Project title must be at least 3 characters long.' });
    }

    // Find member user IDs by emails
    let memberIds = [];
    if (Array.isArray(members) && members.length > 0) {
      const foundUsers = await User.find({ email: { $in: members } }, '_id');
      memberIds = foundUsers.map(user => user._id);
    }

    const project = await Project.create({
      title: title.trim(),
      description: description?.trim() || '',
      status,
      tags,
      roadmap,
      startDate,
      targetDate,
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

// GET /api/projects — Get all projects (owned or member)
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.json(projects);
  } catch (err) {
    console.error('Fetch projects error:', err);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id — Get single project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', '_id name email')
      .populate('members', '_id name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Allow access if user is creator or member
    const isOwner = project.createdBy._id.equals(req.user._id);
    const isMember = project.members.some(member => member._id.equals(req.user._id));

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'You are not authorized to view this project' });
    }

    res.json(project);
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/projects/:id — Update a project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the creator can update this project' });
    }

    const {
      title,
      description,
      status,
      tags,
      roadmap,
      startDate,
      targetDate
    } = req.body;

    if (title && title.trim().length >= 3) project.title = title.trim();
    if (description !== undefined) project.description = description.trim();
    if (status) project.status = status;
    if (tags) project.tags = tags;
    if (roadmap) project.roadmap = roadmap;
    if (startDate) project.startDate = startDate;
    if (targetDate) project.targetDate = targetDate;

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.json(updated);
  } catch (err) {
    console.error('Update project error:', err);
    res.status(400).json({ message: err.message || 'Failed to update project' });
  }
});

// DELETE /api/projects/:id — Delete a project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the creator can delete this project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ message: err.message || 'Failed to delete project' });
  }
});


router.post('/:id/invite', auth, async (req, res) => {
  const { email } = req.body;
  const { id } = req.params;
  const project = await Project.findById(id);
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });
  if (project.members.includes(user._id)) return res.status(400).json({ message: 'Already a member' });

  const existing = await ProjectInvitation.findOne({ project: id, invitedUser: user._id, status: 'pending' });
  if (existing) return res.status(400).json({ message: 'Invitation already pending' });

  await ProjectInvitation.create({
    project: id,
    invitedBy: req.user.id,
    invitedUser: user._id
  });

  res.json({ message: 'Invitation sent' });
});



module.exports = router;
