const mongoose = require("mongoose");

const mongoURL = process.env.MONGO_URL || "mongodb://localhost/partble"

mongoose.connect(mongoURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
})
    .then(() => {
        console.log("💾 Database Connected!")
    })
    .catch(e => console.error(e))