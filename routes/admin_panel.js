const module_express = require("express");
const instance_web = module_express()
const table_user = require("../models/table_user")
const table_post = require("../models/table_post")
const { authenticateToken } = require("../functions")


instance_web.get("/", authenticateToken, async (req, res) => {

    is_admin = await table_user.findOne({
        where: {
            id: res.locals.user_profile.id
        }
    })

    if (is_admin.role !== "admin") {
        res.redirect("/")
    } else {
        res.render("admin_panel")
    }

})

instance_web.get("/users", async (req, res) => {

    if (req.query.operation) {
        
        if (req.query.operation === 'delete') {

            await table_post.destroy({
                where: {
                    id_user: req.query.id
                }
            });

            await table_user.destroy({
                where:
                {
                    id: req.query.id
                }
            }
            )

            res.redirect("/admin/users")
        }

        else if (req.query.operation === 'edit') {
            const user = await table_user.findOne({
                where: {
                    id: req.query.id
                }
            })

            if (user) {
                res.render("admin_users_edit", {profile: user})
            }
        }

    } else {
        const all_users = await table_user.findAll()

        res.render("admin_users", {users: all_users});
    }


})

instance_web.post("/users", async (req, res) => {
    const {id, first_name, last_name, email, password,  bio, role, status} = req.body

    await table_user.update({
        first_name,
        last_name,
        email,
        password,
        bio,
        role,
        status
    },
    {
        where: {
            id
        }
    })

    res.redirect("/admin/users")
})

instance_web.get("/posts", async (req, res) => {
    const posts = await table_post.findAll()

    res.render("admin_posts", {posts})
})



module.exports = instance_web