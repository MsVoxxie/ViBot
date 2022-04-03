const { readdirSync } = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Slash Commands', 'Load Status');

module.exports = async (bot) => {
	readdirSync('./SlashCommands/').forEach(async (dir) => {
		const commands = readdirSync(`./SlashCommands/${dir}/`).filter((file) => file.endsWith('.js'));
		for await (const file of commands) {
			const command = require(`../../SlashCommands/${dir}/${file}`);
			if (command.data.name) {
				await bot.slashCommands.set(command.data.name, command);
				await table.addRow(`${dir} | ${file}`, '✔ » Loaded');
			} else {
				await table.addRow(`${dir} | ${file}`, '❌ » Failed to Load!');
				continue;
			}
		}
	});
	console.log(table.toString());
};
