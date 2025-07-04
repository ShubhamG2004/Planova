const Task = require('../models/Task');

// Create a task
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
