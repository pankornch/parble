const { createToken } = require("../validations/Token");

const Joi = require('joi');

const { User, Venture } = require("../models/User.model");
const { Apply } = require("../models/Job.model");


// ------------------------- GET -------------------------

// ------------------------- Get My Profile -------------------------

module.exports.me = async = (req, res) => {

    if (!req.params.venture) {
        User.findById(req.user._id)
            .populate("identity")
            .exec((err, user) => {
                if (err) return res.sendStatus(400)
                delete user._doc.password
                res.send({
                    user: user,
                    token: createToken({ sub: "auth", id_: user._id })
                })
            })
    } else {
        Venture.findById(req.user.venture, (err, doc) => {
            if (err) return res.sendStatus(400)
            res.json(doc)
        })
    }

}

// ------------------------- Get User -------------------------

module.exports.getUser = async (req, res) => {
    const { uid } = req.params;
    const { q, page = 1 } = req.query

    if (q === "job") {
        return Apply.find(
            {
                $and: [{ employee: uid },
                { $or: [{ status: "approve" }, { status: "completed" }] }]
            })
            .populate({ path: "job", populate: "venture" })
            .populate("review")
            .limit(20)
            .sort("-_id")
            .skip((page - 1) * 20)
            .exec((err, docs) => {
                if (err) return res.sendStatus(400)

                res.json(docs)
            })
    }

    await User.findById(uid, (err, doc) => {
        if (err) return res.sendStatus(400)
        res.json(doc)
    })
}

// ------------------------- PATCH -------------------------

// ------------------------- Update User -------------------------

module.exports.updateUser = async (req, res) => {
    const { user } = req;

    const { value, error } = Joi.object({
        name: Joi.string(),
        avatar: Joi.string(),
        gender: Joi.string(),
        tel_number: Joi.string(),
        dob: Joi.string()
    }).validate(req.body)


    if (error) return res.sendStatus(400)

    User.updateOne({ _id: user._id }, { $set: value }, (err, doc) => {
        if (err) return res.sendStatus(400)
        res.json({ status: true, data: value })
    })

}
