const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const {
  createTask,
  getTasksForProject,
  getTaskById,
  addCommentToTask,
  getTasksAssignedToUser,
  updateTaskStatus,
  updateTask,
} = require('../controllers/taskController');

// ✅ Get tasks assigned to logged-in user — needs to be placed BEFORE /:projectId
router.get('/my', auth, getTasksAssignedToUser);

// ✅ Get single task by ID (with comments)
router.get('/task/:id', auth, getTaskById);

// ✅ Add comment to a task (with mentions)
router.post('/task/:id/comment', auth, addCommentToTask);

// ✅ Get all tasks for a specific project
router.get('/:projectId', auth, getTasksForProject);

// ✅ Create a new task under a project
router.post('/:projectId', auth, createTask);

// Update task status (e.g., mark as completed)
router.put('/task/:id', auth, updateTaskStatus);

// ✅ Update a task
router.put('/task/:id', auth, updateTask);


module.exports = router;
