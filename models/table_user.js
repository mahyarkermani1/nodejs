const { DataTypes } = require("sequelize")
const module_db = require("../database/db_init");

const User = module_db.define("User", {
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {});

module.exports = User