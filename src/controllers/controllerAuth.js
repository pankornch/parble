const { createToken } = require("../validations/Token");
const Joi = require("joi");

const client = require("../../redis")();
const { promisify } = require("util");
const mailer = require("../utils/mailer");
const { hashSync, compareSync } = require("bcryptjs");
const { User, Identity } = require("../models/User.model");

const setAsync = promisify(client.HSET).bind(client);
const getAsync = promisify(client.HGET).bind(client);
const delAsync = promisify(client.HDEL).bind(client);


//  ------------------------- Login -------------------------
module.exports.login = async (req, res) => {
	const { user } = req;
	delete user.identity._doc.password;
	const token = createToken({ sub: "auth", id_: user._id });
	res.json({ user, token });
};

module.exports.register = async (req, res) => {
	const { value, error } = Joi.object({
		email: Joi.string().email().required(),
		name: Joi.string().required(),
		password: Joi.string().required(),
		tel_number: Joi.string().required(),
	}).validate(req.body);

	if (error) return res.sendStatus(400);

	try {
		const identityDoc = new Identity({ strategy: "local", email: value.email, password: hashSync(value.password), is_verify: true })
		const userDoc = new User({ identity: identityDoc._id, name: value.name, tel_number: value.tel_number });
		await Promise.all([identityDoc.save(), userDoc.save()])

		const ctx = { user: { ...userDoc._doc }, }
		ctx.user.identity = identityDoc._doc

		res.status(201).json(ctx)
	} catch (error) {
		res.sendStatus(400)
	}



	// try {

	// 	const identityDoc = new Identity({ strategy: "local", email: value.email, password: hashSync(value.password) })
	// 	const userDoc = new User({ identity: identityDoc._id, name: value.name, tel_number: value.tel_number });

	// 	await Promise.all([identityDoc.save(), userDoc.save()])


	// 	const verifyCode = Math.random().toString().slice(2, 7);

	// 	await setAsync("EmailVerifyCodes", userDoc._id.toString(), JSON.stringify({
	// 		verifyCode: hashSync(verifyCode),
	// 		expired: Date.now() * 5 * 60 * 1000
	// 	}))

	// 	mailer({
	// 		to: value.email,
	// 		subject: "รหัสยืนยันอีเมล",
	// 		text: `สวัสดี, ${value.email}\nเพื่อให้การลงทะเบียนเสร็จสิ้น กรุณาใช้รหัสด้านล่างนี้ กรอกในช่องยืนยันรหัสอีเมลในแอปพลิเคชัน Parble\n ${verifyCode}`,
	// 		html: `
	// 			<h1>สวัสดี, ${value.email}</h1><br/>
	// 			<p>เพื่อให้การลงทะเทียนเสร็จสิ้น กรุณาใช้รหัสด้านล่างนี้ กรอกในช่องยืนยันรหัสอีเมลในแอปพลิเคชัน Parble</p>
	// 			<b>${verifyCode}</p>
	// 			`,
	// 	}).then((info) => {
	// 		console.log(`--- Sent email to ${info.envelope.to} was successful. ---`);
	// 		res.status(201).json({
	// 			user: { ...userDoc._doc, identity: identityDoc },
	// 			token: createToken({ sub: "auth", id_: userDoc._id }),
	// 		});
	// 	});

	// } catch (error) {
	// 	res.sendStatus(400)
	// 	console.error(error)
	// }

};

// ------------------------- Resend Verify code -------------------------
module.exports.resendVerifyCode = async (req, res) => {
	const { user } = req
	// const userVerifyCode = JSON.parse(await getAsync("EmailVerifyCodes", user._id.toString()))
	// if (!userVerifyCode) return res.sendStatus(403)

	const identity = await Identity.findById(user.identity)
	if (identity.strategy !== "local" && identity.is_verify) return res.sendStatus(403)

	const verifyCode = Math.random().toString().slice(2, 7);

	await setAsync("EmailVerifyCodes", user._id.toString(), JSON.stringify({
		verifyCode: hashSync(verifyCode),
		expired: Date.now() * 5 * 60 * 1000
	}))

	mailer({
		to: identity.email,
		subject: "รหัสยืนยันอีเมล",
		text: `สวัสดี, ${identity.email}\nเพื่อให้การลงทะเบียนเสร็จสิ้น กรุณาใช้รหัสด้านล่างนี้ กรอกในช่องยืนยันรหัสอีเมลในแอปพลิเคชัน Parble\n ${verifyCode}`,
		html: `
			<h1>สวัสดี, ${identity.email}</h1><br/>
			<p>เพื่อให้การลงทะเทียนเสร็จสิ้น กรุณาใช้รหัสด้านล่างนี้ กรอกในช่องยืนยันรหัสอีเมลในแอปพลิเคชัน Parble</p>
			<b>${verifyCode}</p>
			`,
	}).then((info) => {
		console.log(`--- Resent email to ${info.envelope.to} was successful. ---`);
		res.json({ status: true })
	});

}

// ------------------------- Verify Email -------------------------

module.exports.verifyEmail = async (req, res) => {
	const { value, error } = Joi.object({
		verify_code: Joi.string().required(),
	}).validate(req.query);

	if (error) return res.sendStatus(400);

	const { user } = req;

	const userVerifyCode = JSON.parse(await getAsync("EmailVerifyCodes", user._id.toString()));

	if (!userVerifyCode) return res.sendStatus(400);

	if (userVerifyCode.expired - Date.now() < 0)
		return res.status(400).json({ message: "expired code" });

	if (!compareSync(value.verify_code, userVerifyCode.verifyCode)) {
		await delAsync("EmailVerifyCodes", user._id.toString());
		return res.status(400).json({ message: "Invalid email verify  code" });
	}

	try {
		await Identity.updateOne({ _id: user.identity }, { $set: { is_verify: true, verified_at: Date.now() } })
		await delAsync("EmailVerifyCodes", user._id.toString());
		res.json({ staus: true });
	} catch (error) {
		res.sendStatus(400)
	}

};

// ------------------------- Login With Facebook -------------------------

module.exports.loginWithFacebook = async (req, res) => {
	const { value, error } = Joi.object({
		facebook_id: Joi.string().required(),
		name: Joi.string().required(),
		avatar: Joi.string().uri().required(),
		email: Joi.string().required(),
	}).validate(req.body);

	if (error) return res.sendStatus(400);

	const identity = await Identity.findOne({ $or: [{ adapter: value.facebook_id }, { email: value.email }] })
	
	// if facebookId is exist in db;
	if (identity) {
		return User.findOne({ identity: identity._id }, (err, doc) => {
			if (err) return req.sendStatus(400)
			res.json({ user: { ...doc._doc, identity }, token: createToken({ sub: "auth", id_: doc._id.toString() }) })
		})
	}

	// if facebook is not exist in db; -> create user
	const identityDoc = await Identity.create({ strategy: "facebook", adapter: value.facebook_id, email: value.email, is_verify: true, verified_at: Date.now() })
	const userDoc = await User.create({ identity: identityDoc._id, name: value.name, avatar: value.avatar })

	res.json({
		user: { ...userDoc._doc, identity: identityDoc },
		token: createToken({ sub: "auth", id_: userDoc._id })
	})
};
