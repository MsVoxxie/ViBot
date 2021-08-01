const mongoose = require('mongoose');
const { Database } = require('../Config/Config.json');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Database', 'Status');

module.exports = {
	init: () => {
		const dbOptions = {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			autoIndex: false,
			poolSize: 5,
			connectTimeoutMS: 10 * 1000,
			family: 4,
		};

		// Login to Database
		mongoose.connect(Database, dbOptions);
		mongoose.set('useFindAndModify', false);
		mongoose.Promise = global.Promise;

		// Logging!
		mongoose.connection.on('connected', () => {
			table.addRow('Mongoose', '✔ » Connected');
			console.log(table.toString());
		});

		mongoose.connection.on('err', err => {
			console.error(`Database Connection Error: \n${err.stack}`);
		});

		mongoose.connection.on('disconnect', () => {
			table.addRow('Mongoose', '❌ » Disconnected');
			console.log(table.toString());
		});
	},
};