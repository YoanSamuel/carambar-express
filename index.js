const express = require("express");
const sequelize = require('./database');
const Joke = require('./Joke');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const seed = require('./seed');
const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
sequelize.sync({force : true }).then(async () => {
    console.log('db is ready to go');

    // ✅ INSÉRER LES BLAGUES AU DEMARRAGE (une seule fois)
    const count = await Joke.count();
    if (count === 0) {
        console.log('🌟 Insertion initiale des blagues Carambar...');
        await seed();
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Carambar API ready on port ${PORT}`);

        const appUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'carambar-express'}.onrender.com`;
        console.log(`🌐 LIVE URL: ${appUrl}`);
        console.log(`📚 Swagger: ${appUrl}/api-docs`);
        console.log(`🎲 Random: ${appUrl}/blagues/random`);
        console.log(`📋 Blagues: ${appUrl}/blagues`);
    });
});


// Fonction utilitaire
async function getJokeById(req) {
    const requestedId = req.params.id;
    const joke = await Joke.findOne({ where: { id: requestedId } });
    return joke;
}


// GET - Blague aléatoire (pour le front)
app.get('/blagues/random', async (req, res) => {
    try {
        const jokes = await Joke.findAll();
        if (jokes.length === 0) {
            return res.status(404).json({ message: 'Aucune blague' });
        }

        // Méthode JS pure = 100% sûr
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        console.log('Random:', randomJoke.question);

        res.json(randomJoke);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur' });
    }
});


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

