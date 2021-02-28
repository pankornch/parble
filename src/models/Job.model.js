const { model, Schema, Types } = require('mongoose')

const Job = model("Jobs", new Schema({
    venture: {
        type: Types.ObjectId,
        required: true,
        ref: "Ventures"
    },
    title: {
        type: String,
        required: true
    },
    dept: {
        type: String,
        required: true
    },
    wage: {
        type: Number,
        required: true
    },
    description: {
        type: String,
    },
    images: [{
        type: String
    }],
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true
    },
    welfare: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    isClose: {
        type: Boolean,
        default: false
    }

}))

const Apply = model("Applies", new Schema({
    job: {
        type: Types.ObjectId,
        required: true,
        ref: "Jobs"
    },
    employee: {
        type: Types.ObjectId,
        required: true,
        ref: "Users"
    },
    status: {
        type: String,
        default: "pending"
    },
    created_at: {
        type: Date,
        default: new Date
    },
    review: {
        type: Types.ObjectId,
        ref: "Reviews"
    }
}))

const Review = model("Reviews", new Schema({
    apply: {
        type: Types.ObjectId,
        required: true,
        ref: "Applies"
    },
    description: {
        type: String,
    },
    rating: {
        type: Number
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}))

const Bookmark = model("Bookmarks", new Schema({
    user: {
        type: Types.ObjectId,
        required: true,
        ref: "Users"
    },
    job: {
        type: Types.ObjectId,
        required: true,
        ref: "Jobs"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}))

const VentureApplies = model("VentureApplies", new Schema({
    venture: {
        type: Types.ObjectId,
        ref: "Venture",
        required: true
    },
    applies: [
        {
            type: Types.ObjectId,
            ref: "Applies",
        }
    ]
}))

module.exports = {
    Job,
    Apply,
    Review,
    Bookmark,
    VentureApplies
}