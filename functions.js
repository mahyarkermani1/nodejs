const jwt = require('jsonwebtoken');

const module_db = require("./database/db_init");

const crypto = require('crypto');

const module_path = require("path")
const fs = require('fs');

const table_post = require("./models/table_post")

const multer = require('multer');

function generateMD5Hash(input) {
    return crypto.createHash('md5').update(input).digest('hex');
}

function FindPhoto(email) {
    photo_hash = generateMD5Hash(email)
    const file_ext = ["jpg", "jpeg", "png"];
    let foundPath = null;

    file_ext.forEach(ext => {
        const file_path = module_path.join(__dirname, "files", "images", "users", `${photo_hash}.${ext}`); // Use __dirname for a reference point
        console.log(file_path)
        // Check if the path exists
        if (fs.existsSync(file_path)) {
            foundPath = `${photo_hash}.${ext}`
            return; // Exit the loop since we found the file
        }
    });

    return foundPath; // Return found path or null
}

async function init_root(next) {
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


async function load_user_posts(user_id) {
    return await table_post.findAll({
        where: {
            id_user: user_id
        }
    })
}

function getMulterStorage(str_value) {
    return multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, "./files/images/users");
        },
        filename: function(req, file, cb) {
            const filename = `${generateMD5Hash(str_value)}${module_path.extname(file.originalname)}`;
            cb(null, filename);
            // Store the filename in the request object for later use
            req.uploadedFileName = filename; // Keep it for the upload process if needed
        }
    });
}


module.exports = {
    authenticateToken,
    init_root,
    generateMD5Hash,
    FindPhoto,
    load_user_posts,
    getMulterStorage
}