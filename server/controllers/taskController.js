const Task = require('../models/Task');

// Create a task
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, status, tags, dueDate } = req.body;
    const { projectId } = req.params;

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      priority,
      status,
      tags,
      dueDate
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('Task creation error:', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// Get all tasks for a project
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
