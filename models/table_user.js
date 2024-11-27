const { DataTypes } = require("sequelize")
const module_db = require("../database/db_init");

const User = module_db.define("User", {
    id: {  // Make sure to add this
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

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
    },

    
    bio: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    token_expiry: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: null
    },

    role: {
        type: DataTypes.ENUM,
        values: ["user", "admin"],
        defaultValue: "user"
    },

    status: {
        type: DataTypes.ENUM,
        values: ["active", "disable"],
        defaultValue: "active"
    }



}, {});

User.sync().then(async () => {
    const admin_email = "Admin@gmail.com"
    const admin = await User.findOne({
        where: {
            email: admin_email,
        }
    })

    if (!admin) {
        await User.create({
            first_name: "Admin",
            last_name: "Admin",
            password: "Admin",
            email: admin_email,
            bio: "This is Admin Account . . .",
            role: "admin",
            status: "active"
    
        })
    }

})

module.exports = User