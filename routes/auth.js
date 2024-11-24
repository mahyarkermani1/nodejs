
const module_express = require("express");
const router_express = module_express.Router();
const table_user = require("../models/table_user")

const cookieParser = require('cookie-parser');
router_express.use(cookieParser());

const jwt = require('jsonwebtoken');
const SECRET_KEY = '123';

const { FindPhoto, load_user_posts } = require("../functions")

function generateToken(id, first_name, email) {
    const payload = { id:id, first_name: first_name, email: email };
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

        const user = await table_user.findOne({
            where: {
            email
        }})


    
        const token = generateToken(user.id, first_name, email)
        res.cookie("login", token)


        res.render("profile", {
            profile: {
                id: user.id,
                email: email,
                first_name: first_name,
                last_name: last_name,
                bio: "",
                password: password
            },
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
 
        const token = generateToken(search_e_p_into_db.id, search_e_p_into_db.first_name, email)
        res.cookie("login", token)

        const photo = FindPhoto(email)
        if (photo) {
            var new_photo = `/images/users/${photo}`
        } else {
            new_photo = null
        }
        const posts = await load_user_posts(search_e_p_into_db.id)


        console.log(`user posts: ${posts.id}`)

        res.render("profile", {
            profile: {
                photo: new_photo,
                email: email,
                first_name: search_e_p_into_db.first_name,
                last_name: search_e_p_into_db.last_name,
                password: password
            },
            posts: posts
        });




        } else {
            res.render("login", {"errorMessage": "Username or password is wrong"})
        }
})


module.exports = router_express