const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createTask, getTasksForProject } = require('../controllers/taskController');

// POST /api/tasks/:projectId — create a new task
router.post('/:projectId', auth, createTask);

// GET /api/tasks/:projectId — get all tasks for a project
router.get('/:projectId', auth, getTasksForProject);

module.exports = router;
