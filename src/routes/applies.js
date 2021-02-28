const router = require('express').Router();

const { JWT_AUTH } = require("../middlewares/jwtAuth")

const { getJobApply, getDeepQuery, updateApplyStatus, applyJob, deleteApply } = require("../controllers/controllerApplies")


router.post("/", JWT_AUTH, applyJob);

router.get("/:apply_id?", JWT_AUTH, getJobApply);

router.get("/:apply_id/:deepQuery", JWT_AUTH, getDeepQuery);

router.patch("/:apply_id", JWT_AUTH, updateApplyStatus);

router.delete("/:apply_id", JWT_AUTH, deleteApply);




module.exports = router;