const router = require('express').Router()

const { createBookmark, getBookmark, deleteBookmark } = require('../controllers/controllerBookmarks');
const { JWT_AUTH } = require("../middlewares/jwtAuth")


router.get('/:bookmark_id*?', JWT_AUTH, getBookmark);

router.post('/:job_id', JWT_AUTH, createBookmark)

router.delete('/:bookmark_id', JWT_AUTH, deleteBookmark)

module.exports = router