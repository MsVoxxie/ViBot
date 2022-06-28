const { readdirSync } = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Slash Commands', 'Load Status');

module.exports = async (bot) => {
	//Read the slash commands folder
	readdirSync('./SlashCommands/').forEach(async (dir) => {
		//Read the subfolders and find commands
		const commands = readdirSync(`./SlashCommands/${dir}/`).filter((file) => file.endsWith('.js'));
		//Loop through the commands
		for await (const file of commands) {
			//Get the command
			const command = require(`../../SlashCommands/${dir}/${file}`);
			//If the command has a valid name, register it.
			if (command.data.name) {
				//If the command type is message or user, remove description from the command data
				if (['MESSAGE', 'USER'].includes(command.data.type)) delete command.data.description;
				await bot.slashCommands.set(command.data.name, command);
				table.addRow(`${dir} | ${file}`, '✔ » Loaded');
			} else {
				//If the command has no name, log it.
				table.addRow(`${dir} | ${file}`, '❌ » Failed to Load!');
				continue;
			}
		}
	});
	console.log(table.toString());
};
