const express = require("express");
const sequelize = require('./database');
const Joke = require('./Joke');

sequelize.sync().then(() => console.log('db is ready to go'));
const app = express();
app.use(express.json());

async function getJokeById(req) {
    const requestedId = req.params.id;
    const joke = await Joke.findOne({where: {id: requestedId}});
    return joke;
}

//POST Joke
app.post('/blagues', async (req, res) => {
    try {
        const { question, answer } = req.body;
        const joke = await Joke.create({
            question,
            answer
        });

        res.status(201).json(joke);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la création de la blague' });
    }
})

// GET All Joke
app.get('/blagues', async(req, res) => {
    const jokes = await Joke.findAll();
    res.send(jokes);
})

// GET One Joke by ID



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

//PUT One joke by ID
app.put('/blagues/:id', async (req, res) => {
    const joke = await getJokeById(req);
    joke.answer = req.body.answer;
    joke.question = req.body.question;

    await joke.save();
    res.send('data updated.')
})

// DELETE  JOKE
app.delete('/blagues/:id', async(req, res) => {
    const requestedId = req.params.id;
    await Joke.destroy({where: {id: requestedId}})
    res.send('Joke removed');
})
app.listen(3000, () => {
  console.log("app is running");
});
