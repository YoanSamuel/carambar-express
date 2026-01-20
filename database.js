const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('Carambar','user', 'password', {
    dialect: 'sqlite',
    host: '.dev.sqlite'

})

module.exports = sequelize;