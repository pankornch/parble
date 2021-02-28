const { User } = require('../models/User.model')
const { verifyToken } = require('../validations/Token');


require('dotenv').config()


module.exports = (socket, next) => {

    const { token } = socket.handshake.query;


    verifyToken(token.split(" ")[1])
        .then(({ id_ }) => {
            User.findById(id_, (err, doc) => {

                if (!doc || err) return socket.disconnect();

                socket.user = doc;

                next()
            })
        })
        .catch(e => socket.disconnect())
}