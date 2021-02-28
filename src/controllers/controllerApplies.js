const Joi = require("joi");
const { Job, Apply, VentureApplies } = require('../models/Job.model')
const { Identity } = require('../models/User.model')
const pub = require('../../redis')()

// ------------------------- GET -------------------------

// ------------------------- Get Job Apply -------------------------
// job_id=213&emploeyy=123
// employee=1234&status=approve
module.exports.getJobApply = async (req, res) => {
    const { value, error } = Joi.object({
        job_id: Joi.string(),
        apply_id: Joi.string(),
        employee_id: Joi.string(),
        page: Joi.string().default(1),
        status: Joi.string(),
    }).validate(req.query);


    if (error) return res.sendStatus(400)
    
    const limit = 20

    let ref = Apply.find()

    if (value.job_id) ref = ref.find({ job: value.job_id })
    else if (value.employee_id) ref = ref.find({ employee: value.employee_id })

    if (value.employee_id && value.status) ref = Apply.find({ $and: [{ employee: value.employee_id }, { status: value.status }] })
    else if (value.job_id && value.employee_id) ref = Apply.findOne({ $and: [{ job: value.job_id }, { employee: value.employee_id }] })


    // if (!Object.keys(value).length && !req.params.apply_id) return res.sendStatus(400)


    // let ref

    // if (value.job_id) ref = Apply.find({ job: value.job_id })
    // else if (value.job_id && value.employee_id) ref = Apply.findOne({ $and: [{ job: value.job_id }, { employee: value.employee_id }] })
    // else if (value.apply_id) ref = Apply.find({ job: value.job_id })


    // if (value.employee_id) ref = Apply.find({ $and: [{ employee: value.employee_id }, { job: value.job_id }] })

    // if (value.status) {
    //     ref = Apply.find({
    //         $and: [
    //             { status: value.status },
    //             { employee: value.employee_id }
    //         ]
    //     })
    // }

    // if (value.employee_id) {
    //     ref = ref.populate({ path: "job", populate: "venture" })
    // } else if (value.job_id || value.apply_id) {
    //     ref = ref.populate("employee", "name avatar tel_number")
    // }

    ref
        .populate({ path: "job", populate: "venture" })
        .populate("employee", "name avatar tel_number")
        .limit(limit)
        .skip((value.page - 1) * limit)
        .exec((err, docs) => {
            if (err) return res.sendStatus(400)
            res.json(docs)
        })

}


// ------------------------- Get Deep Query -------------------------


module.exports.getDeepQuery = async (req, res) => {
    const { value, error } = Joi.object({
        apply_id: Joi.string(),
        deepQuery: Joi.string().valid("job", "employee")
    }).validate(req.params);

    if (error) return res.sendStatus(400)

    Apply.findById(value.apply_id)
        .populate(value.deepQuery)
        .exec((err, doc) => {
            if (err) return res.sendStatus(400)
            res.json(doc[value.deepQuery])
        })
}


// ------------------------- POST -------------------------

// ------------------------- Create Apply -------------------------

module.exports.applyJob = async (req, res) => {
    const { job_id } = req.body;
    const { user } = req;

    if (!job_id) return res.sendStatus(400)

    const identity = await Identity.findById(user.identity)
    const job = await Job.findById(job_id);

    if (!identity.is_verify) return res.sendStatus(403)

    if (await Apply.findOne({ $and: [{ employee: user._id }, { job: job_id }] })) return res.status(400).json({ message: "Can not apply twice" });

    const applyDoc = await Apply.create({ job: job_id, employee: user._id })
    await VentureApplies.updateOne({ venture: job.venture }, { $push: { applies: applyDoc._id } })

    pub.PUBLISH(`job_apply:${job.venture}`, JSON.stringify({ mode: "push" }))


    res.json(applyDoc)
}


// ------------------------- PACTH -------------------------

// ------------------------- Edit Apply -------------------------
module.exports.updateApplyStatus = async (req, res) => {

    const { apply_id } = req.params;
    const { value, error } = Joi.object({
        status: Joi.string().valid("approve", "reject", "completed").required(),
    }).validate(req.body);

    const { user } = req

    if (error) return res.sendStatus(400);

    Apply.findById(apply_id)
        .populate("job")
        .exec(async (err, doc) => {
            if (err) return res.sendStatus(400)
            if (user.venture.toString() !== doc.job.venture.toString()) return res.sendStatus(403)

            await Apply.updateOne({ _id: apply_id }, { $set: value })

            pub.PUBLISH(`status_job:${doc.employee}`, JSON.stringify(value))

            switch (value.status) {
                case "approve": {
                    pub.PUBLISH(`notification:${doc.employee}`, JSON.stringify({
                        title: `งาน ${doc.job.title} ถูกอนุมัติแล้ว`,
                        body: `งาน ${doc.job.title} ถูกอนุมัติแล้ว`
                    }))
                    break
                }
                case "completed": {
                    pub.PUBLISH(`notification:${doc.employee}`, JSON.stringify({
                        title: `งาน ${doc.job.title} ถูกยืนยันแล้ว`,
                        body: `งาน ${doc.job.title} ถูกยืนยันแล้ว`
                    }))
                    break
                }
                case "reject": {
                    pub.PUBLISH(`notification:${doc.employee}`, JSON.stringify({
                        title: `งาน ${doc.job.title} ถูกปฏิเศธ`,
                        body: `งาน ${doc.job.title} ถูกปฏิเศธ`
                    }))
                    break
                }
            }



            res.json({ status: true, data: value })
        })
}

// ------------------------- DELETE -------------------------

// ------------------------- Delete Apply -------------------------

module.exports.deleteApply = async (req, res) => {
    const { apply_id } = req.params
    const { user } = req

    Apply.deleteOne({ $and: [{ employee: user._id }, { _id: apply_id }] }, (err, doc) => {
        if (err) return res.sendStatus(400)
        res.json({ status: true })
    })
}