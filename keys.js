/* refer to https://nodejs.org/api/crypto.html#crypto_crypto_generatekeypair_type_options_callback 
	to know how this key pair is generated.
*/

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

crypto.generateKeyPair('rsa', {
	modulusLength: 4096,
	publicKeyEncoding: {
		type: 'spki',
		format: 'pem'
	},
	privateKeyEncoding: {
		type: 'pkcs8',
		format: 'pem'
	}
},
	(err, publicKey, privateKey) => {
		if (err) {
			console.error(err); return;
		}

		fs.writeFileSync(path.resolve('private_key.pem'), privateKey);
		fs.writeFileSync(path.resolve('public_key.pem'), publicKey);
	});