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

const router_birds = require("./routes/birds");
const router_auth = require("./routes/auth")
const login = require("./routes/render-login")
const register = require("./routes/render-register")

const { authenticateToken, init_root } = require("./functions")


var listen_port = 8585



instance_web.listen(listen_port, init_root, async () => {
     
})


instance_web.get("/", async (req, res) => {
    const _table_user = await table_user.findAll()
    res.render("show_users", {users:_table_user})
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

    db.query('UPDATE Users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE reset_token = ?', [password, token], (err, results) => {
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

    if (search_fn_email_into_db) {
        res.render("profile", {
            profile: {
                email: email,
                first_name: first_name,
                last_name: search_fn_email_into_db.last_name,
                bio: search_fn_email_into_db.bio,
                password: search_fn_email_into_db.password
            }
        });
    } else {
        // Handle case where user is not found
        res.redirect("login");
    }
});


// Set storage settings for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/images/users'); // Specify the uploads directory
    },
    filename: (req, res, file, cb) => {
        authenticateToken(req, res); // Get the email from cookies
        const { email } = res.locals.user_profile
        const hashedEmail = crypto.createHash('sha256').update(email).digest('hex');
        const ext = path.extname(file.originalname).toLowerCase(); // Get file extension
        cb(null, `${hashedEmail}${ext}`); // Save file as hashed email + extension
    }
});


// Create the multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only jpeg and png formats
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File type not supported!'));
    }
});


// Upload photo route
instance_web.post('/upload_photo', upload.single('photo'), (req, res) => {
    if (req.file) {
        res.status(200).send('Photo uploaded successfully!');
    } else {
        res.status(400).send('Error uploading photo.');
    }
});

instance_web.use("/birds", router_birds)
instance_web.use("/auth", router_auth)
instance_web.use("/login", login)
instance_web.use("/register", register)

