const router = require('express').Router();

const { generateTokens, verifyToken, issueTokens } = require('../utils/tokens');
const sendError = require('../utils/sendError');
const { checkUser } = require('../utils/common_operations');

// handles register, login, issuing tokens
router.use('/auth', require('./auth'));

// protected route
router.get('/', async (req, res) => {
	// redirect if unauthorized
	if (!req.cookies.Authorization) {
		return res.status(401).redirect('/auth/login');
	}

	const authorizationCookie = JSON.parse(req.cookies.Authorization);

	// extract actual token string from 'Bearer token-string'
	const accessToken = authorizationCookie['access_token'].split(' ')[1];
	let hasTokenExpired = false;

	await verifyToken(accessToken,
		err => {
			if (err) {
				if (err.name === 'TokenExpiredError')
					return hasTokenExpired = true;

				// report the error if not expired
				return sendError(res, 401, err, '/auth/login');
			}
			// else allow access to resource
			res.status(200).send(`<h1>Yeah! You're Authorized Now!</h1>`);
		});

	// access token expired, now test refresh token
	if (hasTokenExpired) {
		const refreshToken = authorizationCookie['refresh_token'];
		let isTokenValid = true;
		let payload;

		await verifyToken(refreshToken,
			(err, decoded) => {

				if (err) {
					if (err.name === 'TokenExpiredError') {
						// refresh token expired, just prompt user to login again
						isTokenValid = false;
						return sendError(res, 403, err, '/auth/login');
					}

					// report other errors if not expired
					sendError(res, 401, err, '/auth/login');
				}

				payload = decoded;
			});

		// refresh token not expired, use it to refresh the access token
		if (isTokenValid) {
			// check if user from payload exists in the database
			const user = await checkUser(
				{ username: payload.username },
				err => {
					res.sendError(res, 500, err);
				});

			if (!user) {
				return sendError(res, 404, 'User Does Not Exist.');
			}

			if (user.refreshToken === refreshToken) {

				const { access_token } = generateTokens(user,
					err => {
						sendError(res, 500, err);
					},
					// pass this to generate only the access_token
					{ refresh: true }
				);

				access_token &&
					issueTokens(res, {
						access_token,
						refresh_token: refreshToken
					}, user);
			}
		}
	}
})

module.exports = router;