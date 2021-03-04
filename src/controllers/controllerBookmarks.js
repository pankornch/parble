const { Job, Bookmark } = require('../models/Job.model')


// ------------------------- GET -------------------------

// ------------------------- Get User Bookmark -------------------------
module.exports.getBookmark = (req, res) => {
    const { bookmark_id } = req.params;
    const { job_id, page = 1 } = req.query;
    const { user } = req
    const limit = 20

    let ref;

    if (bookmark_id) ref = Bookmark.findOne({ $and: [{ user: user._id }, { _id: bookmark_id }] })
    else if (job_id) ref = Bookmark.findOne({ $and: [{ user: user._id }, { job: job_id }] })
    else ref = Bookmark.find({ user: user._id })

    ref
        .populate({ path: "job", populate: "venture" })
        .sort("-_id")
        .limit(limit)
        .skip((page - 1) * limit)
        .exec((err, doc) => {
            if (err) return res.sendStatus(400)
            res.json(doc)
        })

}

// ------------------------- POST -------------------------

// ------------------------- Create Bookmark -------------------------

module.exports.createBookmark = async (req, res) => {
    const { job_id } = req.params;
    const { user } = req
    const job = await Job.findById(job_id)

    if (!job) return res.sendStatus(400)
    if (await Bookmark.findOne({ $and: [{ user: user._id }, { job: job_id }] })) return res.sendStatus(304)
    const bookmarkDoc = await Bookmark.create({ user: user._id, job: job_id })

    res.json(bookmarkDoc)
}


// ------------------------- DELETE -------------------------

// ------------------------- Delete Bookmark -------------------------

module.exports.deleteBookmark = (req, res) => {
    const { bookmark_id } = req.params
    const { user } = req

    Bookmark.deleteOne({ $and: [{ user: user._id }, { _id: bookmark_id }] }, (err, doc) => {
        if (err || !doc) return res.sendStatus(400)
        res.json({ status: true })
    })
}

