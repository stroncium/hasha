'use strict';
const fs = require('fs');
const crypto = require('crypto');
const {parentPort} = require('worker_threads'); // eslint-disable-line import/no-unresolved, eslint-comments/no-unused-disable

const hashFile = (algorithm, filePath) => new Promise((resolve, reject) => {
	const hasher = crypto.createHash(algorithm);
	fs.createReadStream(filePath)
		.on('error', reject)
		.pipe(hasher)
		.on('error', reject)
		.on('finish', function () {
			resolve(this.read().buffer);
		});
});

parentPort.on('message', async message => {
	const {algorithm, filePath} = message.value;
	try {
		const value = await hashFile(algorithm, filePath);
		parentPort.postMessage({id: message.id, value}, [value]);
	} catch (error) {
		const newError = {message: error.message, stack: error.stack};

		for (const key of Object.keys(error)) {
			if (typeof error[key] !== 'object') {
				newError[key] = error[key];
			}
		}

		parentPort.postMessage({id: message.id, error: newError});
	}
});
