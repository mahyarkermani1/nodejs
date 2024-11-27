const { DataTypes } = require("sequelize")
const module_db = require("../database/db_init");
const User = require("./table_user");

const Post = module_db.define("Post", {
    id_post: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Users",
            key: "id"
        }
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    post_cover: {
        type: DataTypes.STRING,
        allowNull: false
    },



}, {});



module.exports = Post