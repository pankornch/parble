const router = require("express").Router()
const { JWT_AUTH } = require('../middlewares/jwtAuth')
const client = require('../../redis')()

const { promisify } = require('util')

const getAsync = promisify(client.HGET).bind(client)
const setAsync = promisify(client.HSET).bind(client)

router.get("/", JWT_AUTH, async (req, res) => {
    const { user } = req;
    const { field } = req.query
    const notification = JSON.parse(await getAsync("Partble:Notifications", user._id.toString()))
    if (!notification.data?.length) return res.send({ unread: 0, data: [] })

    notification.data.sort((a, b) => a.created_at > b.created_at ? -1 : 1)

    if (field === "unread") {
        return res.json({ unread: notification.unread })
    }

    if (field === "data") {
        return res.json({ data: notification.data })
    }

    res.json(notification)
})

router.put('/read', JWT_AUTH, async (req, res) => {
    const { user } = req;
    const notification = JSON.parse(await getAsync("Partble:Notifications", user._id.toString()))

    await setAsync("Partble:Notifications", user._id.toString(), JSON.stringify({
        ...notification, unread: 0
    }))

    res.json({ status: true })
})

module.exports = router