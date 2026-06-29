const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/services', authenticateToken, taskController.getServices);
router.get('/today', authenticateToken, taskController.getTodayTasks);
router.get('/mine', authenticateToken, taskController.getMyTasks);
router.post('/', authenticateToken, requireAdmin, taskController.createTask);
router.put('/:id/status', authenticateToken, taskController.updateTaskStatus);
router.delete('/:id', authenticateToken, requireAdmin, taskController.deleteTask);

module.exports = router;
