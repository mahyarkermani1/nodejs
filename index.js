const module_express = require("express");
const module_path = require("path")
const module_db = require("./database/db_init");
const router_birds = require("./routes/birds");

const router_auth = require("./routes/auth")
const login = require("./routes/render-login")
const register = require("./routes/render-register")
const jwt = require('jsonwebtoken');




const instance_web = module_express()

var listen_port = 8585

instance_web.use(module_express.urlencoded({extended: true}))
instance_web.set("view engine", "ejs")
instance_web.set("views", module_path.join(__dirname, "views"))

const cookieParser = require('cookie-parser');
instance_web.use(cookieParser());


function authenticateToken(req, res) {
    const SECRET_KEY = '123';
    const token = req.cookies.login

    if (!token) return res.sendStatus(401);

    const token_decode = jwt.verify(token, SECRET_KEY);
    if (token_decode) {
        return token_decode.first_name, token_decode.email
    }
}


instance_web.listen(listen_port, () => {
    console.log(`Listen on port ${listen_port}`)
})


instance_web.get("/", (req, res) => {
    res.send("Home Page")
})

instance_web.get("/profiles", authenticateToken, async (req, res) => {
    const { first_name, email } = authenticateToken()

    if (first_name || email) {
        const search_fn_email_into_db = await table_user.findOne({
            where: {
                first_name: first_name,
                email: email
            }
        })
        
    
        if (search_fn_email_into_db) {
            res.render("profile", {
                profile: {
                    email: email,
                    first_name: first_name,
                    last_name: search_fn_email_into_db.last_name,
                    password: search_fn_email_into_db.password
                }
            });
        }
            
    }
})


instance_web.use("/birds", router_birds)
instance_web.use("/auth", router_auth)
instance_web.use("/login", login)
instance_web.use("/register", register)

try {
    module_db.authenticate();
    console.log("Database is connected :)")
} catch (error) {
    console.error("Error while connecting db: ", error)
}