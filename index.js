const express = require("express");
const sequelize = require('./database');
const Joke = require('./Joke');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const seed = require('./seed');
const path = require('path');
const app = express();

app.use(express.json());

// 🔥 Route racine AVANT sequelize (pour Render health check)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// 🔥 Tes routes API (AVANT sequelize)
async function getJokeById(req) {
    const requestedId = req.params.id;
    const joke = await Joke.findOne({ where: { id: requestedId } });
    return joke;
}

app.get('/blagues/random', async (req, res) => {
    try {
        const jokes = await Joke.findAll();
        if (jokes.length === 0) return res.status(404).json({ message: 'Aucune blague' });
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        res.json(randomJoke);
    } catch (err) {
        res.status(500).json({ error: 'Erreur' });
    }
});

app.get('/blagues', async (req, res) => {
    try {
        const jokes = await Joke.findAll();
        res.json(jokes);
    } catch (err) {
        res.status(500).json({ error: 'Erreur liste blagues' });
    }
});

// Autres routes CRUD...
app.post('/blagues', async (req, res) => {
    try {
        const { question, answer } = req.body;
        const joke = await Joke.create({ question, answer });
        res.status(201).json(joke);
    } catch (err) {
        res.status(500).json({ error: 'Erreur création blague' });
    }
});

// 🔥 DEMARRAGE - DB en arrière-plan
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server démarré sur port ${PORT}`);
    console.log(`✅ https://carambar-express.onrender.com/`);

    // 🔥 DB en arrière-plan (non-bloquant)
    try {
        await sequelize.sync({ force: true });
        console.log('✅ DB prête');

        const count = await Joke.count();
        if (count === 0) {
            console.log('🌟 Insertion blagues...');
            await seed();
            console.log('✅ 10 blagues insérées !');
        }
    } catch (err) {
        console.error('❌ Erreur DB:', err.message);
    }
});
