const jwt = require('jsonwebtoken');

const module_db = require("./database/db_init");

async function init_root() {
    var listen_port = 8585
    console.log(`Listen on port ${listen_port}`)
    try {
        await module_db.authenticate();
        await module_db.sync({
            // force: true
        })
        console.log("Database is connected :)")

    } catch (error) {
        console.error("Error while connecting db: ", error)
    }
}

function authenticateToken(req, res, next) {
    const SECRET_KEY = '123';
    const token = req.cookies.login;

    if (!token) {
        res.redirect("/login");
    }

    try {
        const token_decode = jwt.verify(token, SECRET_KEY);
        console.log(token_decode)
        if (token_decode) {
            res.locals.user_profile = {
                id: token_decode.id,
                first_name: token_decode.first_name,
                email: token_decode.email
            };
            next()
        }
    } catch (err) {
        res.redirect("/login"); // Handle invalid token

    }

    return
}

module.exports = {
    authenticateToken,
    init_root
}