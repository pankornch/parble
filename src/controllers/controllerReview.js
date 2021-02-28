
const Joi = require("joi");
const { Review, Apply } = require('../models/Job.model');
const pub = require('../../redis')()




// ------------------------- GET -------------------------

// ------------------------- Get Review -------------------------

module.exports.getReview = (req, res) => {
    const { value, error } = Joi.object({
        review_id: Joi.string(),
        employee_id: Joi.string(),
    }).validate(req.query);

    if (error || !Object.keys(value).length) return res.sendStatus(400)

    Review.find({ employee: value.employee_id })
        .populate({ path: "apply", populate: "job" })
        .populate("venture")
        .populate("employee")
        .exec((err, docs) => {
            if (err) return res.sendStatus(400)
            res.json(docs)
        })
}


// ------------------------- POST -------------------------

// ------------------------- Create Review -------------------------
module.exports.createReview = async (req, res) => {
    const { value, error } = Joi.object({
        apply_id: Joi.string(),
        description: Joi.string(),
        rating: Joi.number()
    }).validate(req.body);



    const { user } = req;

    if (error || !user.venture) return res.sendStatus(400);

    const applyDoc = await Apply.findById(value.apply_id).populate("job")
    const reviewDoc = new Review({ description: value.description, rating: value.rating, apply: value.apply_id })

    applyDoc.review = reviewDoc._id

    await Promise.all([
        reviewDoc.save(),
        applyDoc.save()
    ])

    pub.PUBLISH(`notification:${applyDoc.employee}`, JSON.stringify({
        title: `งาน ${applyDoc.job.title} ถูกประเมินแล้ว`,
        body: `งาน ${applyDoc.job.title} ถูกประเมินแล้ว`,
    }))

    res.json(reviewDoc)
}


// ------------------------- UPDATE -------------------------

// ------------------------- Update Review -------------------------

module.exports.updateReview = (req, res) => {
    const { review_id } = req.params;
    const { value, error } = Joi.object({
        description: Joi.string()
    }).validate(req.body);

    const { user } = req;

    if (error || !user.venture) return res.sendStatus(400);

    Review.updateOne({ $and: [{ venture: user.venture }, { _id: review_id }, { $set: value }] }, (err, doc) => {
        if (err) return res.sendStatus(400)

        res.json({ status: true, data: value })
    })

}


// ------------------------- DELETE -------------------------

// ------------------------- Delete Review -------------------------

module.exports.deleteReview = (req, res) => {
    const { review_id } = req.params;
    const { user } = req

    Review.deleteOne({ $and: [{ venture: user.venture }, { _id: review_id }] }, (err, doc) => {
        if (error) return res.sendStatus(400)

        res.json({ status: true })
    })

}
