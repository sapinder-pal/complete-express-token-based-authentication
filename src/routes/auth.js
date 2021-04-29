const router = require('express').Router();
const path = require('path');

const User = require('../config/database');
const { checkUser, hashPassword, verifyPassword } = require('../utils/common_operations');
const { generateTokens, issueTokens } = require('../utils/tokens');
const sendError = require('../utils/sendError');


router.get('/register', (req, res) =>
	res.sendFile(path.resolve('public', 'html', 'register.html'))
);

router.get('/login', (req, res) =>
	res.sendFile(path.resolve('public', 'html', 'login.html'))
);

router.post('/register', async (req, res) => {
	const formFields = {
		username: req.body.username,
		password: req.body.password
	};

	const userExists = await checkUser(
		{ username: formFields.username },
		err => {
			sendError(res, 500, err);
		});

	if (userExists) {
		return sendError(res, 409, 'User Already Exists.');
	}

	const hashedPassword = await hashPassword(
		formFields.password,
		10, // saltrounds
		err => {
			sendError(res, 500, err);
		});

	if (!hashedPassword) {
		return;
	}

	const newUser = new User({
		username: formFields.username,
		hashedPassword: hashedPassword
	});

	newUser.save().then((user, err) => {
		if (err) {
			return sendError(res, 500, err);
		}
		// redirect and pass user info to /auth/issue_tokens
		res.redirect(`/auth/issue_tokens?user=${JSON.stringify(user)}`);
	})
})

/*********************************    LOGIN    **************************************/
router.post('/login', async (req, res) => {
	const formFields = {
		username: req.body.username,
		password: req.body.password
	};

	const user = await checkUser(
		{ username: formFields.username },
		err => {
			sendError(res, 500, err);
		});

	if (!user) {
		return sendError(res, 404, 'User Does Not Exist.');
	}

	const isPasswordCorrect = await verifyPassword(
		req.body.password,
		user.hashedPassword,
		err => {
			sendError(res, 500, err);
		});

	if (!isPasswordCorrect) {
		return sendError(res, 404, 'Incorrect Password.');
	}
	// redirect and pass user info to /auth/issue_tokens
	res.redirect(`/auth/issue_tokens?user=${JSON.stringify(user)}`);
})

/*********************************    ISSUE TOKENS    **************************************/
router.get('/issue_tokens', (req, res) => {
	const user = JSON.parse(req.query.user);

	const tokens = generateTokens(user,
		err => {
			sendError(res, 500, err);
		});

	// if tokens have been generated, issue them
	tokens && issueTokens(res, tokens, user);
})

module.exports = router;