const passport = require('passport');

module.exports.JWT_AUTH = passport.authenticate("jwt", { session: false });