const { readdirSync } = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Bot Functions', 'Load Status');

module.exports = async (bot) => {
	//Read the functions folder
	const functions = readdirSync('./Storage/Functions/').filter((file) => file.endsWith('.js'));
	//Loop through the functions
	for await (const func of functions) {
		try {
			require(`../Functions/${func}`)(bot);
			table.addRow(`${func}`, '✔ » Loaded');
		} catch (err) {
			//If the command has no name, log it.
			table.addRow(`${func}`, '✕ » Errored');
			console.error(err);
			continue;
		}
	}
	console.log(table.toString());
};
