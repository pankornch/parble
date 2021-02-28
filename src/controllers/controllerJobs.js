const Joi = require("joi");
const { Job, Apply } = require('../models/Job.model')

// ------------------------- GET -------------------------

// ------------------------- Get All Jobs -------------------------
// query 
// apply=false, q=venture

module.exports.viewJobs = async (req, res) => {

    const { value, error } = Joi.object({
        job_id: Joi.string(),
        venture_id: Joi.string(),
        q: Joi.string().valid("venture"),
        apply: Joi.boolean(),
        page: Joi.number()
    }).validate(req.query);

    const { user } = req;
    if (error) return res.sendStatus(400);

    const page = value.page || 1
    const limit = 20

    let ref = Job.find({ isClose: false })
    const populate = value.q
    const jobId = req.params.job_id || value.job_id

    if (jobId) {
        ref = Job.findOne({ $and: [{ _id: jobId, isClose: false }] })
    } else if (value.apply !== undefined) {
        const userApplies = await Apply.find({ employee: user._id })
        const applyIds = userApplies.map(e => e.job)
        ref = Job.find({ $and: [{ _id: { $nin: applyIds } }, { isClose: false }] })
    }



    ref.populate(populate)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort("-_id")
        .exec((err, docs) => {
            if (err) return res.sendStatus(400)
            res.json(docs)
        })
}

// ------------------------- Get Deep Query -------------------------

module.exports.getDeepQuery = (req, res) => {
    const { value, error } = Joi.object({
        job_id: Joi.string(),
        deepQuery: Joi.string().valid("venture", "applies")
    }).validate(req.params)

    if (error) return res.send({});

    let ref = Job.findById(value.job_id)

    switch (value.deepQuery) {
        case "venture": {
            ref = ref.populate("venture").select("venture")
            break
        }
        case "applies": {
            ref = Apply.find({ job: value.job_id }).sort("-_id")
                .populate("employee", "name tel_number avatar")
            break
        }
    }

    ref.exec((err, docs) => {
        if (err) return res.sendStatus(400)
        res.json(docs)
    })

}

// ------------------------- POST -------------------------

// ------------------------- Create Job -------------------------

module.exports.createJob = async (req, res) => {
    const { venture } = req.user;
    const { value, error } = Joi.object({
        title: Joi.string().required(),
        dept: Joi.string().required(),
        wage: Joi.number().required(),
        description: Joi.string().required(),
        images: Joi.array().items(Joi.string().uri()),
        start_time: Joi.string().required(),
        end_time: Joi.string().required(),
        welfare: Joi.string(),
    }).validate(req.body);

    if (error) return res.sendStatus(400);

    if (!venture) return res.sendStatus(403)

    const jobDoc = await Job.create({ venture, ...value })

    res.status(201).json(jobDoc)
    res.end()

}




// ------------------------- PATCH -------------------------

// ------------------------- Edit Job -------------------------

module.exports.jobEdit = async (req, res) => {
    const { job_id } = req.params;
    const { value, error } = Joi.object({
        title: Joi.string().required(),
        dept: Joi.string().required(),
        wage: Joi.number().required(),
        description: Joi.string().required(),
        images: Joi.array().items(Joi.string().uri()),
        start_time: Joi.string().required(),
        end_time: Joi.string().required(),
        welfare: Joi.string(),
        isClose: Joi.boolean()
    }).validate(req.body);

    if (error) return res.sendStatus(400);

    await Job.updateOne({ _id: job_id }, { $set: value })

    res.json({ status: true })

}


// ------------------------- DELETE -------------------------

// ------------------------- Delete Job -------------------------

module.exports.deleteJob = async (req, res) => {
    const { job_id } = req.params;
    const { user } = req

    Job.deleteOne({ $and: [{ _id: job_id }, { venture: user.venture }] }, (err, doc) => {
        if (err) return res.sendStatus(400)
        res.json({ status: true })
    })
}


