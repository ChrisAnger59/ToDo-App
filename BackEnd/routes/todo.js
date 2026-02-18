// points d'entrées todos

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const todoCtrl = require('../controllers/todo');

router.post('/', auth, todoCtrl.createTodo);
router.get('/', auth, todoCtrl.getAllTodos);
router.put('/:id/move', auth, todoCtrl.moveTodo);
router.put('/:id', auth, todoCtrl.updateTodo);
router.delete('/:id', auth, todoCtrl.deleteTodo);

module.exports = router;