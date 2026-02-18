// structure des taches

const mongoose = require('mongoose');

const todoSchema = mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    default: ''
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  // Equivalent ForeignKey SQL
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  columnId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Column',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Todo', todoSchema);
