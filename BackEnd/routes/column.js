// points d'entrées columns

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const columnCtrl = require('../controllers/column');

router.post('/', auth, columnCtrl.createColumn);
router.get('/', auth, columnCtrl.getAllColumns);
//router.put('/reorder', auth, columnCtrl.reorderColumns);  
router.put('/:id', auth, columnCtrl.updateColumn);
router.delete('/:id', auth, columnCtrl.deleteColumn);

module.exports = router;
