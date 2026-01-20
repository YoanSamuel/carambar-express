const { Model, DataTypes } = require('sequelize');
const sequelize =  require('./database');

class Joke extends Model {}

Joke.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    question: {
        type: DataTypes.STRING
    },
    answer: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'joke'

})

module.exports = Joke;