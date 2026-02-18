//logique CRUD des todos

const Todo = require('../models/Todo');
const Column = require('../models/Column');

exports.createTodo = async (req, res, next) => {
  try {
    const { title, columnId } = req.body;  // Récupérer columnId

    // VÉRIFIER QUE LA COLONNE EXISTE ET APPARTIENT À L'USER
    const column = await Column.findOne({ 
      _id: columnId, 
      userId: req.auth.userId 
    });

    if (!column) {
      return res.status(404).json({ error: 'Colonne invalide ou inexistante !' });
    }

    // Créer la tâche
    const todo = new Todo({
      title,
      columnId,  // Assigner la colonne
      userId: req.auth.userId,
      completed: false
    });

    await todo.save();
    res.status(201).json({ message: 'Tâche créée !', todo });

  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getAllTodos = async (req, res, next) => {
  try {
    const todos = await Todo.find({ userId: req.auth.userId })
      .sort({ createdAt: -1 });

    // GROUPER PAR COLONNE
    const todosByColumn = todos.reduce((acc, todo) => {
      const colId = todo.columnId.toString();
      if (!acc[colId]) {
        acc[colId] = [];
      }
      acc[colId].push(todo);
      return acc;
    }, {});

    res.status(200).json(todosByColumn);

  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.updateTodo = (req, res, next) => {
  Todo.findOne({ _id: req.params.id, userId: req.auth.userId })
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ error: 'Todo non trouvée !' });
      }

      Todo.updateOne(
        { _id: req.params.id },
        { ...req.body, _id: req.params.id }
      )
        .then(() => res.status(200).json({ message: 'Todo modifiée !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.moveTodo = async (req, res, next) => {
  try {
    const { columnId } = req.body;

    // Vérifier que la tâche existe et appartient à l'user
    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      userId: req.auth.userId 
    });

    if (!todo) {
      return res.status(404).json({ error: 'Tâche non trouvée !' });
    }

    // Vérifier que la colonne de destination existe
    const column = await Column.findOne({ 
      _id: columnId, 
      userId: req.auth.userId 
    });

    if (!column) {
      return res.status(404).json({ error: 'Colonne invalide !' });
    }

    // Déplacer la tâche
    todo.columnId = columnId;
    await todo.save();

    res.status(200).json({ message: 'Tâche déplacée !', todo });

  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.deleteTodo = (req, res, next) => {
  Todo.findOne({ _id: req.params.id, userId: req.auth.userId })
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ error: 'Todo non trouvée !' });
      }

      Todo.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Todo supprimée !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};