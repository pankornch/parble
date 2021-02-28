const router = require('express').Router();

const { search } = require("../controllers/controllerSearch")

router.get("/", search)

module.exports = router;