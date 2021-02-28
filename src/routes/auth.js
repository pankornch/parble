const router = require('express').Router();
const passport = require('passport')
const { login, register, verifyEmail, loginWithFacebook, resendVerifyCode } = require("../controllers/controllerAuth")
const { JWT_AUTH } = require('../middlewares/jwtAuth')

router.post("/register", register);

router.post("/login", passport.authenticate("local", { session: false }), login);

router.post('/verify_email', JWT_AUTH, verifyEmail);

router.post('/resend_verify_code', JWT_AUTH, resendVerifyCode)

router.post("/login_with_facebook", loginWithFacebook);

module.exports = router