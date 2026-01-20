const express = require("express");
const sequelize = require('./database');
const Joke = require('./Joke');

sequelize.sync().then(() => console.log('db is ready to go'));
const app = express();

app.post('/blagues', (req, res) => {
    Joke.create(req.body).then(() => {
      res.send('joke is created.');
    })
})
app.listen(3000, () => {
  console.log("app is running");
});
