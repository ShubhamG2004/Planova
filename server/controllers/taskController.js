// controllers/taskController.js
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// Create Task
exports.createTask = async (req, res) => {
  const { title, description, status, assignedTo, startDate, dueDate } = req.body;
  const { projectId } = req.params;

  try {
    const task = new Task({
      title,
      description,
      status,
      assignedTo,
      startDate,
      dueDate,
      project: projectId,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// Get Tasks for a Project
exports.getTasksForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (err) {
    console.error('Failed to get tasks:', err);
    res.status(500).json({ message: 'Failed to load tasks' });
  }
};

// Get Task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email'
      });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (err) {
    console.error('Failed to fetch task:', err);
    res.status(500).json({ message: 'Failed to get task' });
  }
};

// Add Comment to Task
exports.addCommentToTask = async (req, res) => {
  const { text, mentions } = req.body;
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = {
      user: req.user._id,
      text,
      mentions: mentions || [],
    };

    task.comments.push(comment);
    await task.save();

    res.status(201).json({ message: 'Comment added', comment });
  } catch (err) {
    console.error('Failed to add comment:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// GET /api/tasks/my — tasks assigned to logged-in user
exports.getTasksAssignedToUser = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'title')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    console.error('Failed to fetch assigned tasks:', err);
    res.status(500).json({ message: 'Error loading assigned tasks' });
  }
};


exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if the task is assigned and the current user is the assignee
    if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not allowed to update this task' });
    }

    // Update status
    task.status = req.body.status || task.status;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('❌ Error updating task status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
