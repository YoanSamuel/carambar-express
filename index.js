const express = require("express");
const sequelize = require('./database');
const Joke = require('./Joke');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const seed = require('./seed');
const path = require('path');  // 🔥 AJOUTÉ pour sendFile
const app = express();

app.use(express.json());
app.use(express.static('.'));  // 🔥 SERVE tous les fichiers statiques (index.html, etc)

// 🔥 AFFICHAGE index.html sur la racine (OBLIGATOIRE Render)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

sequelize.sync({force : true }).then(async () => {
    console.log('db is ready to go');

    const count = await Joke.count();
    if (count === 0) {
        console.log('🌟 Insertion initiale des blagues Carambar...');
        await seed();
        console.log('✅ 10 blagues insérées !');
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {  // 🔥 '0.0.0.0' OBLIGATOIRE Render
        console.log(`🚀 Carambar API ready on port ${PORT}`);
        console.log(`✅ Page d'accueil: https://carambar-express.onrender.com/`);
        console.log(`✅ Swagger: https://carambar-express.onrender.com/api-docs`);
    });
});

// Tes routes API (PARFAITES)
async function getJokeById(req) {
    const requestedId = req.params.id;
    const joke = await Joke.findOne({ where: { id: requestedId } });
    return joke;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

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

app.post('/blagues', async (req, res) => {
    try {
        const { question, answer } = req.body;
        const joke = await Joke.create({ question, answer });
        res.status(201).json(joke);
    } catch (err) {
        res.status(500).json({ error: 'Erreur création blague' });
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

app.get('/blagues/:id', async (req, res) => {
    try {
        const joke = await getJokeById(req);
        if (!joke) return res.status(404).json({ message: 'Blague non trouvée' });
        res.json(joke);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.put('/blagues/:id', async (req, res) => {
    try {
        const joke = await getJokeById(req);
        if (!joke) return res.status(404).json({ message: 'Blague non trouvée' });
        const { question, answer } = req.body;
        await joke.update({ question, answer });
        res.json(joke);
    } catch (err) {
        res.status(500).json({ error: 'Erreur modification' });
    }
});

app.delete('/blagues/:id', async (req, res) => {
    try {
        const deleted = await Joke.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'Blague non trouvée' });
        res.json({ message: 'Blague supprimée' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur suppression' });
    }
});
