const mongoose = require('mongoose');
const { Database } = require('../Config/Config.json');

module.exports = {
	init: () => {
		const dbOptions = {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			autoIndex: false,
			poolSize: 5,
			connectTimeoutMS: 10000,
			family: 4,
		};

		//Login to Database
		mongoose.connect(Database, dbOptions);
		mongoose.set('useFindAndModify', false);
		mongoose.Promise = global.Promise;

		//Logging!
		mongoose.connection.on('connected', () => {
			console.log('Connected To Database');
		});

		mongoose.connection.on('err', err => {
			console.error(`Database Connection Error: \n${err.stack}`);
		});

		mongoose.connection.on('disconnect', () => {
			console.log('Database Disconnected');
		});
	},
};