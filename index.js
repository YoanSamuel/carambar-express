const express = require("express");
const sequelize = require('./database');
const Joke = require('./Joke');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const seed = require('./seed');
const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

sequelize.sync({force : true }).then(async () => {
    console.log('db is ready to go');

    // ✅ INSÉRER LES BLAGUES AU DEMARRAGE (une seule fois)
    const count = await Joke.count();
    if (count === 0) {
        console.log('🌟 Insertion initiale des blagues Carambar...');
        await seed();
    }

    app.listen(3000, () => {
        console.log("app is running on http://localhost:3000");
    });
});


// Fonction utilitaire
async function getJokeById(req) {
    const requestedId = req.params.id;
    const joke = await Joke.findOne({ where: { id: requestedId } });
    return joke;
}

// POST - Créer une blague
app.post('/blagues', async (req, res) => {
    try {
        const { question, answer } = req.body;
        const joke = await Joke.create({ question, answer });
        res.status(201).json(joke);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur création blague' });
    }
});

// GET - Toutes les blagues
app.get('/blagues', async (req, res) => {
    try {
        const jokes = await Joke.findAll();
        res.json(jokes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur liste blagues' });
    }
});

// GET - Une blague par ID
app.get('/blagues/:id', async (req, res) => {
    try {
        const joke = await getJokeById(req);
        if (!joke) {
            return res.status(404).json({ message: 'Blague non trouvée' });
        }
        res.json(joke);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// PUT - Modifier une blague
app.put('/blagues/:id', async (req, res) => {
    try {
        const joke = await getJokeById(req);
        if (!joke) {
            return res.status(404).json({ message: 'Blague non trouvée' });
        }

        const { question, answer } = req.body;
        await joke.update({ question, answer });
        res.json(joke);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur modification' });
    }
});

// DELETE - Supprimer une blague
app.delete('/blagues/:id', async (req, res) => {
    try {
        const deleted = await Joke.destroy({ where: { id: req.params.id } });
        if (!deleted) {
            return res.status(404).json({ message: 'Blague non trouvée' });
        }
        res.json({ message: 'Blague supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur suppression' });
    }
});

// GET - Blague aléatoire (pour le front)
app.get('/blagues/random', async (req, res) => {
    try {
        const joke = await Joke.findOne({
            order: sequelize.literal('RAND()'),
            limit: 1
        });
        if (!joke) {
            return res.status(404).json({ message: 'Aucune blague disponible' });
        }
        res.json(joke);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur blague aléatoire' });
    }
});
