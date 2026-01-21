const express = require("express");
const path = require('path');
const app = express();

app.use(express.json());

// 🔥 HEALTH CHECK RENDER (1er PRIORITÉ)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 🔥 PING pour Render (ultra-rapide)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api-docs', require('swagger-ui-express').serve, require('swagger-ui-express').setup(require('./swagger.json')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// 🔥 SERVER DÉMARRE IMMÉDIATEMENT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server UP on port ${PORT}`);
    console.log(`✅ https://carambar-express.onrender.com/`);
});

// 🔥 DB en arrière-plan (NON bloquant)
require('./database').sync({force: true}).then(async () => {
    console.log('✅ DB OK');
    const count = await require('./Joke').count();
    if (count === 0) {
        console.log('🌟 Seed...');
        await require('./seed')();
        console.log('✅ Blagues OK');
    }
}).catch(err => console.error('DB Error:', err));

// Tes routes API après
app.get('/blagues/random', async (req, res) => {
    try {
        const jokes = await require('./Joke').findAll();
        if (jokes.length === 0) return res.status(404).json({ message: 'Aucune blague' });
        res.json(jokes[Math.floor(Math.random() * jokes.length)]);
    } catch (err) {
        res.status(500).json({ error: 'Erreur' });
    }
});

app.get('/blagues', async (req, res) => {
    try {
        const jokes = await require('./Joke').findAll();
        res.json(jokes);
    } catch (err) {
        res.status(500).json({ error: 'Erreur' });
    }
});
