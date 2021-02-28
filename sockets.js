const sub = require('./redis')()
const client = require('./redis')()
require('events').EventEmitter.defaultMaxListeners = 100;

const { promisify } = require("util");
const { v4 } = require('uuid');

const getAsync = promisify(client.HGET).bind(client)
const setAsync = promisify(client.HSET).bind(client)


module.exports = (server) => {
    const io = require('socket.io')(server, {
        serveClient: false,
        pingInterval: 10000,
        pingTimeout: 5000,
        cookie: false
    });
    io.use(require('./src/middlewares/socketMiddleware'))


    io.on("connection", socket => {
        console.log(`${socket.user._id}'s connected`);

        socket.join(`__${socket.user._id}`)
        
        if (socket.user.venture) socket.join(`__${socket.user.venture}`)

        sub.SUBSCRIBE(
            socket.user.venture ? `job_apply:${socket.user.venture}` : '',
            `job_status:${socket.user._id}`,
            `notification:${socket.user._id}`
        )

        socket.on("disconnect", () => {
            console.log(`${socket.user._id}'s Disconnect`)
        })
    })





    sub.on("message", async (channel, data) => {
        const [room, id] = channel.split(":")

        switch (room) {
            case "notification": {
                const json = { ...JSON.parse(data), created_at: Date.now(), _id: v4() }

                let notification = JSON.parse(await getAsync("Partble:Notifications", id))
                let unread = notification?.unread || 0

                if (notification === null) {
                    unread = 1
                    notification = { unread, data: [json] }

                    await setAsync("Partble:Notifications", id, JSON.stringify(notification))
                } else {
                    unread = notification.unread + 1
                    await setAsync("Partble:Notifications", id, JSON.stringify({
                        data: [...notification?.data || [], json],
                        unread
                    }))
                }

                io.sockets.to(`__${id}`).emit(room, json)
                io.sockets.to(`__${id}`).emit("unread", { unread })

                break
            }

            case "job_apply": {
                io.sockets.to(`__${id}`).emit(room, JSON.parse(data))
                break
            }

            case "job_status": {
                break
            }

            default: break
        }

    })
}
