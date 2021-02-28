const Joi = require("joi");
const { VentureApplies, Job } = require("../models/Job.model");
const { User, Venture } = require('../models/User.model');

// ------------------------- GET -------------------------

// ------------------------- Get Venture -------------------------

module.exports.getVenture = async (req, res) => {
    Venture.findById(req.params.venture_id, (err, doc) => {
        if (err) return res.sendStatus(400)
        res.json(doc)
    })
}

// ------------------------- Get Venture Jobs -------------------------

module.exports.getVentureJob = async (req, res) => {
    const { page = 1 } = req.query
    const limit = 20

    Job.find({ venture: req.params.venture_id })
        .sort("-_id")
        .limit(limit)
        .skip((page - 1) * limit)
        .exec((err, docs) => {
            if (err) return res.sendStatus(400)
            res.json(docs)
        })
}


// ------------------------- Get Venture Apply -------------------------

module.exports.getVentureApply = async (req, res) => {
    // statue=pending || approve || reject || completed
    const { value, error } = Joi.object({
        status: Joi.string().valid("pending", "approve", "completed", "reject")
    }).validate(req.query)

    if (error) return res.sendStatus(400)

    VentureApplies.findOne({ venture: req.params.venture_id })
        .populate({
            path: "applies",
            match: value,
            options: { sort: { _id: -1 } },
            populate: [{
                path: "employee",
                select: "name avatar tel_number"
            },
            {
                path: "job"
            }
            ],

        })
        .exec((err, docs) => {
            if (err) return res.sendStatus(400)
            res.json(docs)
        })
}

// ------------------------- POST -------------------------

// ------------------------- Venture Signup -------------------------

module.exports.ventureSignup = async (req, res) => {
    const { user } = req;
    const { value, error } = Joi.object({
        company_name: Joi.string().required(),
        tel_number: Joi.string().required(),
        certificate_number: Joi.string().required(),
        type: Joi.string().required(),
        address: Joi.string().required(),
        avatar: Joi.string().uri().required()
    }).validate(req.body);

    if (error) return res.sendStatus(400);
    if (user.ventureId) return res.status(304).json({ data: user });

    const ventureDoc = new Venture(value)

    await Promise.all([
        ventureDoc.save(),
        User.updateOne({ _id: user._id }, { $set: { venture: ventureDoc._id } }),
        VentureApplies.create({ venture: ventureDoc._id })
    ])


    res.status(201).json({ venture: ventureDoc });

}

// ------------------------- PATCH -------------------------

// ------------------------- Update Venture -------------------------

module.exports.updateVenture = async (req, res) => {
    const { user } = req;
    const { value, error } = Joi.object({
        avatar: Joi.string(),
    }).validate(req.body);

    if (error || !user.venture) return res.sendStatus(403);

    await Venture.updateOne({ _id: user.venture }, { $set: value });

    res.json({ status: true })
}
