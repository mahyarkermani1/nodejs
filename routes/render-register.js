const module_express = require("express");
const router_express = module_express.Router();



router_express.get("/", (req, res) => {
    res.render("register")
})

module.exports = router_express