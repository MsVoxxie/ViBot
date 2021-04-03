const fs = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Events', 'Load Status');

module.exports.setup = bot => {
	fs.readdir('./Events/', (err, files) => {
		if (err) console.error(err);
		const event_files = files.filter(f => f.split('.').pop() === 'js');
		if (event_files.length <= 0) return console.log('No Events to load.');
		event_files.forEach((f, i) => {
			require(`../../Events/${f}`);
			table.addRow(`${f}`, '✔ -> Loaded');
		});
		console.log(table.toString());
	});
};