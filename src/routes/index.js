const router = require('express').Router();

router.use('/api/auth', require('./auth'))
router.use('/api/users', require('./users'))
router.use('/api/jobs', require('./jobs'))
router.use('/api/reviews', require('./reviews'))
router.use('/api/bookmarks', require('./bookmarks'))
router.use('/api/applies', require("./applies"))
router.use('/api/search', require('./search'))
router.use('/api/ventures', require("./ventures"))
router.use('/api/notifications', require('./notifications'))


module.exports = router;