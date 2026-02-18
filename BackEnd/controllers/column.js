// controllers/column.js
// Logique CRUD colonnes

const Column = require('../models/Column');  // Correction chemin
const Todo = require('../models/Todo');

// CRÉER UNE COLONNE (avec order automatique)
exports.createColumn = async (req, res, next) => {
  try {
    const { title } = req.body;
    
    // Calculer automatiquement le prochain order
    const lastColumn = await Column.findOne({ userId: req.auth.userId })
      .sort({ order: -1 });  // Récupère la colonne avec le plus grand order
    
    const newOrder = lastColumn ? lastColumn.order + 1 : 0;
    
    const column = new Column({
      title,
      order: newOrder,  // Auto-incrémenté
      userId: req.auth.userId  // Correction (enlevé .body)
    });

    await column.save();
    res.status(201).json({ message: 'Colonne créée !', column });
    
  } catch (error) {
    res.status(400).json({ error });
  }
};

// RÉCUPÉRER TOUTES LES COLONNES
exports.getAllColumns = (req, res, next) => {
  Column.find({ userId: req.auth.userId })
    .sort({ order: 1 })  // Tri par ordre croissant
    .then(columns => res.status(200).json(columns))
    .catch(error => res.status(400).json({ error }));
};

// MODIFIER UNE COLONNE
exports.updateColumn = (req, res, next) => {
  Column.findOne({ _id: req.params.id, userId: req.auth.userId })
    .then(column => {
      if (!column) {
        return res.status(404).json({ error: 'Colonne non trouvée !' });
      }

      // SÉCURITÉ : Ne pas permettre de modifier userId et order ici
      const { title } = req.body;  // Seulement title modifiable

      Column.updateOne(
        { _id: req.params.id },
        { title, _id: req.params.id }  // Plus sécurisé
      )
        .then(() => res.status(200).json({ message: 'Colonne modifiée !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// SUPPRIMER UNE COLONNE
exports.deleteColumn = async (req, res, next) => {
  try {
    // Vérifier que la colonne appartient à l'user
    const column = await Column.findOne({ 
      _id: req.params.id, 
      userId: req.auth.userId 
    });

    if (!column) {
      return res.status(404).json({ error: 'Colonne non trouvée !' });
    }

    // VÉRIFIER SI DES TÂCHES UTILISENT CETTE COLONNE
    const tasksInColumn = await Todo.countDocuments({ 
      columnId: req.params.id 
    });

    if (tasksInColumn > 0) {
      return res.status(400).json({ 
        error: `Impossible de supprimer : ${tasksInColumn} tâche(s) présente(s)` 
      });
    }

    // Supprimer la colonne
    await Column.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Colonne supprimée !' });

  } catch (error) {
    res.status(500).json({ error });
  }
};

// RÉORGANISER LES COLONNES (drag & drop)
exports.reorderColumns = async (req, res, next) => {
  try {
    const { columns } = req.body;  
    // Attendu : [{ id: "aaa", order: 0 }, { id: "bbb", order: 1 }, ...]
    
    // Vérifier que toutes les colonnes appartiennent à l'utilisateur
    const userColumns = await Column.find({ 
      _id: { $in: columns.map(c => c.id) },
      userId: req.auth.userId 
    });
    
    if (userColumns.length !== columns.length) {
      return res.status(403).json({ error: 'Certaines colonnes ne vous appartiennent pas' });
    }
    
    // Mettre à jour tous les ordres en parallèle
    const updates = columns.map(col => 
      Column.updateOne(
        { _id: col.id, userId: req.auth.userId },
        { order: col.order }
      )
    );
    
    await Promise.all(updates);
    res.status(200).json({ message: 'Colonnes réorganisées !' });
    
  } catch (error) {
    res.status(400).json({ error });
  }
};
