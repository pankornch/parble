const { Schema, Types, model } = require("mongoose")

const User = model("Users", new Schema({
    name: {
        type: String,
    },
    tel_number: {
        type: String,
        unique: true
    },
    avatar: {
        type: String,
    },
    gender: {
        type: String,
    },
    dob: {
        type: Date,
    },
    identity: {
        type: Types.ObjectId,
        required: true,
        ref: "Identities"
    },
    venture: {
        type: Types.ObjectId,
        ref: "Ventures"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}))

const Identity = model("Identities", new Schema({
    strategy: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    adapter: {
        type: String,
    },
    is_verify: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    verified_at: {
        type: Date,
    }
}))

const Venture = model("Ventures", new Schema({
    company_name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    certificate_number: {
        type: String,
        required: true,
        uniqe: true
    },
    tel_number: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}))

module.exports = {
    User,
    Identity,
    Venture
}