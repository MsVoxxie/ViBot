const { readdirSync } = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Commands', 'Load Status');

module.exports = async (bot) => {
	readdirSync('./Commands/').forEach(async (dir) => {
		const commands = readdirSync(`./Commands/${dir}/`).filter((file) => file.endsWith('.js'));
		for await (const file of commands) {
			const pull = require(`../../Commands/${dir}/${file}`);

			if (pull.name) {
				await bot.commands.set(pull.name, pull);
				await table.addRow(`${dir} | ${file}`, '✔ » Loaded');
			} else {
				await table.addRow(`${dir} | ${file}`, '❌ » Failed to Load!');
				continue;
			}
			if (pull.aliases) {
				await pull.aliases.forEach((alias) => bot.aliases.set(alias, pull.name));
			}
		}
	});
	console.log(table.toString());
};