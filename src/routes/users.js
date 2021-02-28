const router = require('express').Router();

const { updateUser, me, getUser } = require('../controllers/controllerUser');

const { JWT_AUTH } = require("../middlewares/jwtAuth");

router.get("/me/:venture?", JWT_AUTH, me);

router.get('/:uid', JWT_AUTH, getUser)

router.patch("/", JWT_AUTH, updateUser);



module.exports = router;
