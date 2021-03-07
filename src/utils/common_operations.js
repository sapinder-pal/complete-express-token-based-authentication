const bcrypt = require('bcrypt');
const User = require('../config/database');

/**
 * @description Runs `bcrypt.hash()` function inside `try-catch` block
 * and passes any error to the `errHandler` callback passed to this function
 * @returns A `Promise` that resolves with the encrypted *string*
 */
async function hashPassword(password, saltRounds, errHandler) {
	try {
		return await bcrypt.hash(password, saltRounds);
	} catch (err) {
		errHandler(err);
	}
}

/**
 * @description Runs `bcrypt.compare()` function inside `try-catch` block
 * and passes any error to the `errHandler` callback passed to this function
 * @returns A `Promise` that resolves with either `true` or `false` 
 */
async function verifyPassword(password, hashedPassword, errHandler) {
	try {
		return await bcrypt.compare(password, hashedPassword)
	} catch (err) {
		errHandler(err);
	}
}

/**
 * @description Runs `findOne()` method inside `try-catch` block
 * and passes any error to the `errHandler` callback passed to this function
 * @returns A Promise that resolves with the `User` if found; else resolves with `null`
 */
async function checkUser(query, errHandler) {
	try {
		return await User.findOne(query);
	}
	catch (err) {
		errHandler(err);
	}
}

module.exports = {
	hashPassword,
	checkUser,
	verifyPassword
}