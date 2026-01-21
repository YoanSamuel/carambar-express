const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const app = express();
app.use(express.json());

const Joke = require("./Joke");


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});


app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(require("./swagger.json"))
);

// API ROADS

// GET ALL
app.get("/blagues", async (req, res) => {
    try {
        const jokes = await Joke.findAll();
        res.json(jokes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// GET RANDOM
app.get("/blagues/random", async (req, res) => {
    try {
        const jokes = await Joke.findAll();

        if (!jokes.length) {
            return res.status(404).json({ message: "Aucune blague" });
        }

        const random = jokes[Math.floor(Math.random() * jokes.length)];
        res.json(random);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// GET BY ID
app.get("/blagues/:id", async (req, res) => {
    try {
        const joke = await Joke.findByPk(req.params.id);

        if (!joke) {
            return res.status(404).json({ message: "Blague introuvable" });
        }

        res.json(joke);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// POST
app.post("/blagues", async (req, res) => {
    try {
        const { question, answer } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                message: "question et answer sont obligatoires"
            });
        }

        const joke = await Joke.create({ question, answer });
        res.status(201).json(joke);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// PUT (UPDATE TOTAL)
app.put("/blagues/:id", async (req, res) => {
    try {
        const joke = await Joke.findByPk(req.params.id);

        if (!joke) {
            return res.status(404).json({ message: "Blague introuvable" });
        }

        joke.question = req.body.question;
        joke.answer = req.body.answer;

        await joke.save();
        res.json({ message: "Blague mise à jour", joke });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.patch("/blagues/:id", async (req, res) => {
    try {
        const joke = await Joke.findByPk(req.params.id);

        if (!joke) {
            return res.status(404).json({ message: "Blague introuvable" });
        }

        joke.question = req.body.question ?? joke.question;
        joke.answer = req.body.answer ?? joke.answer;

        await joke.save();
        res.json({ message: "Blague modifiée", joke });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.delete("/blagues/:id", async (req, res) => {
    try {
        const deleted = await Joke.destroy({
            where: { id: req.params.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: "Blague introuvable" });
        }

        res.json({ message: "Blague supprimée" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

(async () => {
    try {
        const sequelize = require("./database");

        await sequelize.authenticate();
        console.log("✅ DB connectée");

        await sequelize.sync();
        console.log("✅ DB synchronisée");

        const count = await Joke.count();
        if (count === 0) {
            console.log("🌱 Seed des blagues...");
            await require("./seed")();
            console.log("✅ Seed terminé");
        }

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server UP on port ${PORT}`);
        });

    } catch (error) {
        console.error("❌ Erreur au démarrage :", error);
        process.exit(1);
    }
})();
