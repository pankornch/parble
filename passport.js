const passport = require("passport");
const passportJWT = require("passport-jwt");

const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtrachJWT = passportJWT.ExtractJwt;

const { User, Identity } = require("./src/models/User.model")
const { compareSync } = require("bcryptjs")

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, cb) => {

        return Identity.findOne({ email }, (err, identity) => {
            if (err) return cb(err, null)

            if (!identity) return cb(null, false)

            if (!compareSync(password, identity.password)) return cb(null, false)

            User.findOne({ identity: identity._id.toString() }, (err, user) => {
                cb(null, { ...user._doc, identity })
            })
        })
    }))

passport.use(
    new JWTStrategy({
        jwtFromRequest: ExtrachJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    }, async (payload, cb) => {

        User.findById(payload.id_, (err, doc) => {
            if (err) return cb(err, null)
            if (!doc) return cb(false, null)

            cb(null, doc._doc)
        })

    })
)

passport.serializeUser((user, cb) => {
    cb(null, user.uid);
})

passport.deserializeUser((id, cb) => {
    User.findById(id, (err, doc) => {
        if (err) return cb(err, null)
        if (!doc) return cb(false, null)

        cb(null, doc._doc)
    })
})