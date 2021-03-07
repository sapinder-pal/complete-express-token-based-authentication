const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../config/database');
const sendError = require('../utils/sendError');

const PRIVATE_KEY = fs.readFileSync(path.resolve('private_key.pem'), 'utf-8');
const PUBLIC_KEY = fs.readFileSync(path.resolve('public_key.pem'), 'utf-8');

/**
 * @param {Object} user - User Details to be stored in the Payload
 * @param {Function} errHandler - A function that catches any error occurred
 * @param {Object} options - Accepts only 1 property `refresh`, which is a `boolean`
 * indicating whether to generate only access token, or the refresh token as well.
 * @returns An `Object` containing the token(s)
 */
function generateTokens(user, errHandler, options) {
	const payload = {
		sub: user._id,
		iat: Date.now(),
		exp: (Date.now() / 1000) + 30,  // 30s, generally set to a few minutes
		username: user.username
	};

	try {
		const accessToken = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });

		// generate only access token if `refresh` is true
		if (options && options.refresh) {
			return {
				access_token: `Bearer ${accessToken}`
			}
		}

		// else also generate refreshToken
		const refreshToken = jwt.sign({
			...payload,
			exp: (Date.now() / 1000) + 60     // 60s, can set them to a few hours, days, or weeks based upon preference & security
		},
			PRIVATE_KEY, { algorithm: 'RS256' }
		);

		return {
			access_token: `Bearer ${accessToken}`,
			refresh_token: refreshToken
		};
	} catch (err) {
		errHandler(err)
	}
}

/**
 * @description Accepts a token and a callback that are directly passed to 
 * `jwt.verify()` method
 */
async function verifyToken(token, callback) {
	jwt.verify(token, PUBLIC_KEY, callback);
}

/**
 * @param {Response} responseObj - A `Response` object to be used to send HTTP request
 * @param {object} tokens - Contains the tokens to be issued
 * @param {object} user - The user to whom token is be issued
*/
async function issueTokens(responseObj, tokens, user) {
	// send tokens in 'Authorization' cookie
	responseObj.cookie('Authorization',
		JSON.stringify(tokens),
		{
			httpOnly: true,
			sameSite: 'lax',
			secure: true
		});

	// store refresh token in the user's document
	User.updateOne(
		{ _id: user._id },
		{ refreshToken: tokens.refresh_token },
		err => {
			if (err) {
				return sendError(responseObj, 500, err);
			};

			responseObj.status(200).redirect('/');
		}
	);
}

module.exports = { generateTokens, verifyToken, issueTokens };