const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const {
  createTask,
  getTasksForProject,
  getTaskById,
  addCommentToTask,
} = require('../controllers/taskController');

// ✅ Get single task by ID (with comments)
router.get('/task/:id', auth, getTaskById);

// ✅ Add comment to a task (with mentions)
router.post('/task/:id/comment', auth, addCommentToTask);

// GET /api/tasks/:projectId — get all tasks for a project
router.get('/:projectId', auth, getTasksForProject);

// ✅ Create a new task under a project
router.post('/:projectId', auth, createTask);

module.exports = router;
