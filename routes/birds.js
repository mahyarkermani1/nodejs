const module_express = require("express");
const router_express = module_express.Router();

router_express.get("/", (req, res) => {
    res.send("Birds Home Page")
})

router_express.get("/about", (req, res) => {
    res.send("Birds About Page")
})

router_express.get("/admin/admin", (req, res) => {
    res.send("Admin page")
})

module.exports = router_express