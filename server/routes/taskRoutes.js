const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createTask,
  getTasksForProject,
  getTaskById,
  addCommentToTask
} = require('../controllers/taskController');

// ✅ Create a new task under a project
// POST /api/tasks/:projectId
router.post('/:projectId', auth, createTask);

// ✅ Get all tasks for a specific project
// GET /api/tasks/project/:projectId
router.get('/project/:projectId', auth, getTasksForProject);

// ✅ Get single task with details and comments
// GET /api/tasks/task/:id
router.get('/task/:id', auth, getTaskById);

// ✅ Add a comment to a task (with mentions)
// POST /api/tasks/task/:id/comment
router.post('/task/:id/comment', auth, addCommentToTask);

module.exports = router;
