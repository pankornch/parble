const router = require('express').Router();

const { createReview, deleteReview, getReview, updateReview } = require('../controllers/controllerReview')
const { JWT_AUTH } = require("../middlewares/jwtAuth")


router.get('/:reviewId?', getReview);

router.post('/', JWT_AUTH, createReview);

router.patch('/:reviewId', JWT_AUTH, updateReview);

router.delete('/:reviewId', JWT_AUTH, deleteReview);

module.exports = router;


