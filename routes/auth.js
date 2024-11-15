
const module_express = require("express");
const router_express = module_express.Router();
const table_user = require("../models/table_user")

const cookieParser = require('cookie-parser');
router_express.use(cookieParser());

const jwt = require('jsonwebtoken');
const SECRET_KEY = '123';

function generateToken(first_name, email) {
    const payload = { first_name: first_name, email: email };
    const options = { expiresIn: '24h' }; // Adjust expiration as needed
    return jwt.sign(payload, SECRET_KEY, options);
}


router_express.get("/user_show", async (req, res) => {
    const columns = await table_user.findAll();
    res.send(columns)
})

router_express.post("/register", async (req, res) => {
    const { first_name, last_name, email, password } = req.body

    const search_email_into_db = await table_user.findOne({
        where: {
            email: email
        }
    })

    if (search_email_into_db) {
        res.render("register", {"errorMessage": `Email "${email} is exists !"`})
    } else {
        await table_user.create({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: password
        })
    
        const token = generateToken(first_name, email)
        res.cookie("login", token)
        res.render("profile", {
            profile: {
                email: email,
                first_name: first_name,
                last_name: last_name,
                password: password
            }
        });
    }


})



router_express.post("/login", async (req, res) => {
    const { email, password } = req.body


    const search_e_p_into_db = await table_user.findOne({
        where: {
            email: email,
            password: password
        }
    })

    if (search_e_p_into_db) {
 
        const token = generateToken(search_e_p_into_db.first_name, email)
        res.cookie("login", token)
        res.render("profile", {
            profile: {
                email: email,
                first_name: search_e_p_into_db.first_name,
                last_name: search_e_p_into_db.last_name,
                password: password
            }
        });


        } else {
            res.render("login", {"errorMessage": "Username or password is wrong"})
        }
})


module.exports = router_express