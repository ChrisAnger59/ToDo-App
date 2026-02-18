// import du package dotenv
// les variables de .env deviennent accessibles grace à .config()
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');
const todoRoutes = require('./routes/todo');
const columnRoutes = require('./routes/column');
const app = express();

// creation d'une instance Express
// activation du CORS
app.use(cors());

//transforme le corps JSON en objet JavaScript
app.use(express.json());

// connexion bdd MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connexion à MongoDB reussi'))
    .catch((error) => console.error('Connexion à MongoDB échouée: ', error));

app.use('/api/auth', userRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/columns', columnRoutes);

// route de test
app.get('/api', (req, res) =>{
    res.json({
        message: 'API opérationnelle',
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = app;