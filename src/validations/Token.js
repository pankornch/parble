const jwt = require('jsonwebtoken');
require('dotenv').config();


function createToken(obj) {
    return jwt.sign(obj, process.env.JWT_SECRET)
}

function verifyToken(token) {
    return new Promise((resolve, reject) => {

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                reject("Invalid token")
            }
            resolve(decoded)
        })
    })
}


module.exports = {
    createToken,
    verifyToken
}