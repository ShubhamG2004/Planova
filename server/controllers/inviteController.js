// server/controllers/inviteController.js

const Invite = require('../models/Invite');
const Project = require('../models/Project');
const User = require('../models/User');

// GET /api/invites
exports.getInvitesForUser = async (req, res) => {
  try {
    const invites = await Invite.find({ receiver: req.user._id })
      .populate('sender', 'name email')
      .populate('project', 'title');
    res.json(invites);
  } catch (err) {
    console.error('Failed to fetch invites:', err);
    res.status(500).json({ message: 'Failed to load invites' });
  }
};

// POST /api/invites/:id/respond
exports.respondToInvite = async (req, res) => {
  const { action } = req.body;
  const { id } = req.params;

  try {
    const invite = await Invite.findById(id).populate('project');

    if (!invite || invite.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this invite' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ message: 'Invite already responded to' });
    }

    invite.status = action === 'accept' ? 'accepted' : 'rejected';
    await invite.save();

    if (action === 'accept') {
      const project = await Project.findById(invite.project._id);
      if (!project.members.includes(req.user._id)) {
        project.members.push(req.user._id);
        await project.save();
      }
    }

    res.json({ message: `Invite ${action}ed successfully` });
  } catch (err) {
    console.error(`Failed to ${action} invite:`, err);
    res.status(500).json({ message: 'Error responding to invite' });
  }
};

// POST /api/invites/:projectId
exports.sendInvite = async (req, res) => {
  const { email } = req.body;
  const { projectId } = req.params;

  try {
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const existingInvite = await Invite.findOne({
      sender: req.user._id,
      receiver: invitedUser._id,
      project: project._id,
      status: 'pending'
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'Invite already sent to this user' });
    }

    const invite = await Invite.create({
      sender: req.user._id,
      receiver: invitedUser._id,
      project: project._id
    });

    res.status(201).json(invite);
  } catch (err) {
    console.error('Failed to send invite:', err);
    res.status(500).json({ message: 'Failed to send invite' });
  }
};
