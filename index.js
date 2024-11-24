const module_path = require("path")

const module_express = require("express");
const instance_web = module_express()
instance_web.use(module_express.urlencoded({extended: true}))
instance_web.set("view engine", "ejs")
instance_web.set("views", module_path.join(__dirname, "views"))
instance_web.use(module_express.static(module_path.join(__dirname, "files")))

const dotenv = require('dotenv');
dotenv.config();

const { v4: uuidv4 } = require('uuid');

const bodyParser = require('body-parser');
instance_web.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
instance_web.use(cookieParser());


const Sequelize = require('sequelize');

const multer = require('multer');


const module_db = require("./database/db_init");

const table_user = require("./models/table_user")
const table_post = require("./models/table_post")

const router_birds = require("./routes/birds");
const router_auth = require("./routes/auth")
const login = require("./routes/render-login")
const register = require("./routes/render-register")

const { authenticateToken, init_root } = require("./functions")


var listen_port = 8585



instance_web.listen(listen_port, (res, req, next) => {
    init_root()
})


instance_web.get("/", async (req, res) => {
    const _table_user = await table_user.findAll()
    res.render("show_users", {users:_table_user})
})

instance_web.get("/create_post", authenticateToken, async (req, res) => {

    if (req.query.operation === 'delete') {
        
            db.query('DELETE FROM Posts WHERE id_post = ? AND id_user = ?', [req.query.id_post, req.query.id_user], (error) => {
                if (error) throw error;
                res.send('Post deleted successfully');
            });

    } else if (req.query.operation === 'load') {
        const user_posts = await table_post.findAll({
            where: {
                id_user: req.query.id_user
            }
        })

            res.render("profile", {
                posts: {user_posts},
            });
    } else {
        res.render("create_post")
    }

})


instance_web.post("/create_post", authenticateToken, async (req, res) => {
    const {title, content} = req.body
    console.log(res.locals.user_profile.id)
    console.log(res.locals.user_profile)
    await table_post.create({
        id_user: res.locals.user_profile.id,
        title,
        content
    })
    res.send("Post created successfully.")
})



instance_web.get('/request-reset', (req, res) => {
    res.render('request-reset');
});


instance_web.post('/request-reset', async (req, res) => {
    const email = req.body.email;
    const token = uuidv4();
    const expiry = new Date(Date.now() + 3600000).toISOString().slice(0, 19).replace('T', ' '); // Format as YYYY-MM-DD HH:MM:SS

    try {
        // Update reset_token and token_expiry
        const result = await table_user.update(
            { reset_token: token, token_expiry: expiry },
            { where: { email: email } }
        );

        if (result[0] === 0) {
            return res.render("request-reset", { "errorMessage": "Email not found" });
        }

        // Create the reset link
        const fullUrl = req.protocol + '://' + req.get('host') + "/reset-password";
        const link = `${fullUrl}/${token}`;
        
        console.log(link)
        res.redirect('login');
    } catch (err) {
        console.error("Database error:", err); // Log the error
        res.status(500).send("An error occurred while processing your request.");
    }
});


instance_web.get('/reset-password/:token', (req, res) => {
    const token = req.params.token;
    module_db.query('SELECT * FROM Users WHERE reset_token = :token AND token_expiry > NOW()', { 
        replacements: { token }, 
        type: Sequelize.QueryTypes.SELECT 
    })
    .then(results => {
        if (results.length === 0) {
            return res.send('Invalid or expired token');
        }
        res.render('reset-password', { token });
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('An error occurred while processing your request.');
    });
});


instance_web.post('/reset-password', async (req, res) => {
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
        return res.send('Passwords do not match');
    }

    try {

        const result = await table_user.update(
            { password: password, reset_token: null, token_expiry: null },
            { where: { reset_token: token } }
        );

        if (result[0] === 0) {
            return res.send('Invalid or expired token');
        }

        res.redirect('login');
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("An error occurred while processing your request.");
    }
});


instance_web.post('/reset-password', (req, res) => {
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
        return res.send('Passwords do not match');
    }

    module_db.query('UPDATE Users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE reset_token = ?', [password, token], (err, results) => {
        if (err) throw err;
        res.redirect("login");
    });
});


instance_web.get("/profiles", authenticateToken, async (req, res, next) => {



    const { first_name, email } = res.locals.user_profile;

    const search_fn_email_into_db = await table_user.findOne({
        where: {
            first_name: first_name,
            email: email
        }
    });

    const user_posts = await table_post.findAll({
        where: {
            id_user: search_fn_email_into_db.id
        }
    })
    if (search_fn_email_into_db) {

        const photo = FindPhoto(email)
        if (photo) {
            var new_photo = `/images/users/${photo}`
        } else {
            new_photo = null
        }

        res.render("profile", {
            profile: {
                photo: new_photo,
                id: search_fn_email_into_db.id,
                email: email,
                first_name: first_name,
                last_name: search_fn_email_into_db.last_name,
                bio: search_fn_email_into_db.bio,
                password: search_fn_email_into_db.password
            },
            posts: {user_posts}
        });
    } else {
        // Handle case where user is not found
        res.redirect("login");
    }
});


instance_web.get("/logout", authenticateToken, async (req, res, next) => {

    res.clearCookie("login").redirect("login")
})
instance_web.use("/birds", router_birds)
instance_web.use("/auth", router_auth)
instance_web.use("/login", login)
instance_web.use("/register", register)

