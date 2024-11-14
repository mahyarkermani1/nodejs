const module_express = require("express");
const router_express = module_express.Router();


router_express.get("/", (req, res) => {
    res.render("login")
})

module.exports = router_express