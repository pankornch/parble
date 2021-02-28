const Joi = require('joi')
const { ventureSignup, updateVenture, getVenture, getVentureJob, getVentureApply } = require('../controllers/controllerVentures')
const { JWT_AUTH } = require('../middlewares/jwtAuth')
const { Job, VentureApplies } = require('../models/Job.model')
const { Venture } = require("../models/User.model")

const router = require('express').Router()


router.get("/:venture_id", JWT_AUTH, getVenture)

router.get('/:venture_id/jobs', JWT_AUTH, getVentureJob)

router.get("/:venture_id/applies", JWT_AUTH, getVentureApply)

router.post("/", JWT_AUTH, ventureSignup)

router.patch("/:venture_id", JWT_AUTH, updateVenture)


module.exports = router