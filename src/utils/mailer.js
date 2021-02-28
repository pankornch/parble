const nodemailer = require('nodemailer')
require('dotenv').config();

module.exports = async (message) => {

    return new Promise((resolve, reject) => {

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            port: 587,
            secure: true,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        transporter.sendMail({
            ...message,
            from: `"Partble" <${process.env.MAILER_USER}>`,

        }, (err, info) => {
            if (err) return reject(err)

            resolve(info);
        })
    })


}