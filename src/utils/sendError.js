/**
 * @param {Response} responseObj - A `Response` object to be used to send HTTP request.
 * @param {Number} status - A `number` indicating the status of the response.
 * @param {object|string} error - An `Error` object or a message `String`.
 * @param {String} redirectTo - [Optional] A path to redirect to.
 */

function sendError(responseObj, status, error, redirectTo = null) {
	console.error(error);

	if (redirectTo) {
		return responseObj.status(status).redirect(redirectTo);
	}

	/* send message based on whether error is an object or a string */
	const message = error.message || error;

	return responseObj.status(status).send(message);
}

module.exports = sendError;