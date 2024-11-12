const { Sequelize } = require("sequelize");

const DB = new Sequelize("node", "mahyar", "mahyar123", {
    host: "localhost",
    dialect: "mysql",
})

module.exports = DB