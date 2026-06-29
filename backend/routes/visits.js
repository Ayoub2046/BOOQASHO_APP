const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Reports need to be declared BEFORE GET /:id or they will be matched as ID parameter
router.get('/export/excel', reportController.exportExcel);
router.get('/export/csv', reportController.exportCSV);

router.get('/', visitController.getVisits);
router.get('/:id', visitController.getVisitById);
router.post('/', visitController.createVisit);
router.put('/:id', visitController.updateVisit);
router.delete('/:id', visitController.deleteVisit);

module.exports = router;
