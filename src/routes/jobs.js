const router = require('express').Router();
const {
    viewJobs,
    getDeepQuery,
    createJob,
    deleteJob,
    jobEdit,
} = require('../controllers/controllerJobs')

const { JWT_AUTH } = require("../middlewares/jwtAuth")


router.get('/:job_id?', JWT_AUTH, viewJobs);

router.get('/:job_id/:deepQuery', JWT_AUTH, getDeepQuery);

router.post('/', JWT_AUTH, createJob);

router.patch('/:job_id', JWT_AUTH, jobEdit);

router.delete('/:job_id', JWT_AUTH, deleteJob);


module.exports = router;