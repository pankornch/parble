// const Fuse = require('fuse.js');
const { Job } = require("../models/Job.model")


module.exports.search = async (req, res) => {
    const { search, page = 1 } = req.query;
    const limit = 20;

    Job.find({ $or: [{ title: { $regex: search } }, { dept: { $regex: search } }] })
        .populate("venture")
        .sort("-_id")
        .limit(limit)
        .skip((page - 1) * limit)
        .exec((err, docs) => {
            if (err) return res.sendStatus(400)
            res.json(docs)
        })
}



// Fuse
// const options = {
//     threshold: 0.2,
//     keys: [
//         "title",
//         "dept",
//     ]
// }

// const jobs = await Job.find()

// const fuse = new Fuse(jobs, options);
// const result = fuse.search(search);
// const pm = result
//     .map(e => e.item)
// res.send(await Promise.all(pm))
