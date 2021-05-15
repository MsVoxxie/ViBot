const { readdirSync } = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Commands', 'Load Status');

module.exports = bot => {
	readdirSync('./Commands/').forEach(dir => {
		const commands = readdirSync(`./Commands/${dir}/`).filter(file => file.endsWith('.js'));
		for (const file of commands) {
			const pull = require(`../../Commands/${dir}/${file}`);

			if (pull.name) {
				bot.commands.set(pull.name, pull);
				table.addRow(`${dir} | ${file}`, '✔ -> Loaded');
			}
			else {
				table.addRow(`${dir} | ${file}`, '❌ -> Failed to Load!');
				continue;
			}
			if (pull.aliases) {
				pull.aliases.forEach(alias => bot.aliases.set(alias, pull.name));
			}
		}
	});
	console.log(table.toString());
};