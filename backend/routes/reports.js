const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Report preview and exports
router.get('/preview', reportController.getPreview);
router.get('/export/excel', reportController.exportExcel);
router.get('/export/csv', reportController.exportCSV);

module.exports = router;
