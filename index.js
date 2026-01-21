// const express = require("express");
// const path = require("path");
// const swaggerUi = require("swagger-ui-express");
//
// const app = express();
// app.use(express.json());
//
// // =======================
// // MODELS
// // =======================
// const Joke = require("./Joke");
//
// // =======================
// // UTILS
// // =======================
// async function getJokeById(id) {
//     return await Joke.findOne({ where: { id } });
// }
//
// // =======================
// // HEALTH & STATIC
// // =======================
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "index.html"));
// });
//
// app.get("/health", (req, res) => {
//     res.status(200).json({ status: "ok" });
// });
//
// // =======================
// // SWAGGER
// // =======================
// app.use(
//     "/api-docs",
//     swaggerUi.serve,
//     swaggerUi.setup(require("./swagger.json"))
// );
//
// // =======================
// // ROUTES API
// // =======================
// app.get("/blagues/random", async (req, res) => {
//     try {
//         const jokes = await Joke.findAll();
//         if (!jokes.length) {
//             return res.status(404).json({ message: "Aucune blague" });
//         }
//         const random = jokes[Math.floor(Math.random() * jokes.length)];
//         res.json(random);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Erreur serveur" });
//     }
// });
//
// app.get("/blagues", async (req, res) => {
//     try {
//         const jokes = await Joke.findAll();
//         res.json(jokes);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Erreur serveur" });
//     }
// });
//
// // =======================
// // UPDATE JOKE
// // =======================
// app.put("/blagues/:id", async (req, res) => {
//     try {
//         const joke = await getJokeById(req.params.id);
//
//         if (!joke) {
//             return res.status(404).json({ message: "Blague introuvable" });
//         }
//
//         joke.question = req.body.question ?? joke.question;
//         joke.answer = req.body.answer ?? joke.answer;
//
//         await joke.save();
//         res.json({ message: "Blague mise à jour", joke });
//
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Erreur serveur" });
//     }
// });
//
// // =======================
// // DELETE JOKE
// // =======================
// app.delete("/blagues/:id", async (req, res) => {
//     try {
//         const deleted = await Joke.destroy({
//             where: { id: req.params.id }
//         });
//
//         if (!deleted) {
//             return res.status(404).json({ message: "Blague introuvable" });
//         }
//
//         res.json({ message: "Blague supprimée" });
//
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Erreur serveur" });
//     }
// });
//
// // =======================
// // BOOTSTRAP (RENDER SAFE)
// // =======================
// (async () => {
//     try {
//         const sequelize = require("./database");
//         await sequelize.sync();
//         console.log("✅ Database synchronisée");
//
//         const count = await Joke.count();
//         if (count === 0) {
//             console.log("🌱 Seed...");
//             await require("./seed")();
//         }
//
//         const PORT = process.env.PORT || 3000;
//         app.listen(PORT, "0.0.0.0", () => {
//             console.log(`🚀 Server UP on port ${PORT}`);
//         });
//
//     } catch (error) {
//         console.error("❌ Erreur au démarrage :", error);
//         process.exit(1);
//     }
// })();
const express = require("express");
const app = express();

console.log("🚀 Boot start");

app.get("/", (req, res) => {
    res.status(200).send("OK");
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

(async () => {
    try {
        const sequelize = require("./database");

        await sequelize.authenticate();
        await sequelize.sync();

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 LISTENING ON ${PORT}`);
        });

    } catch (e) {
        console.error("❌ BOOT FAIL", e);
        process.exit(1);
    }
})();
