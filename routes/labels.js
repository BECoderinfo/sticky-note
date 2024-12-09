const exprress = require('express');
const router = exprress.Router();

const labelController = require('../Controllers/labelController');

router.post('/create', labelController.createLabel);
router.get('/getall', labelController.getAllLabels);
router.get('/get/:id', labelController.getLabelById);
router.put('/update/:id', labelController.updateLabel);
router.delete('/delete/:id', labelController.deleteLabel);

module.exports = router