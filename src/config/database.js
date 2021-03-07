const mongoose = require('mongoose');
require('dotenv').config();

const dbUrl = process.env.DB_URL;

const connection = mongoose.createConnection(dbUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
});

connection.on('connected', _ => console.log('mongodb connected'));

const UserSchema = new mongoose.Schema({
	username: { type: String, unique: true, required: true },
	hashedPassword: { type: String, unique: true, required: true },
	refreshToken: { type: Object, unique: true }
});

const User = connection.model('Users', UserSchema);

module.exports = User;