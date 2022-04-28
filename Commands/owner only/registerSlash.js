const { readdirSync } = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Token } = require('../../Storage/Config/Config.json');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Slash Commands', 'Registration Status');

module.exports = {
	name: 'registerSlash',
	aliases: ['register'],
	description: 'Register my Slash Commands',
	example: '',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		const cmds = [];
		await readdirSync('./SlashCommands/').forEach(async (dir) => {
			const commands = readdirSync(`./SlashCommands/${dir}/`).filter((file) => file.endsWith('.js'));
			for await (const file of commands) {
				const command = require(`../../SlashCommands/${dir}/${file}`);
				if (command.data) {
					table.addRow(`${dir} | ${file}`, '✔ » Registered');
					cmds.push(command.data.toJSON());
				} else {
					table.addRow(`${dir} | ${file}`, '❌ » Failed to Register!');
					continue;
				}
			}
		});
		await bot.sleep(1000);
		const rest = new REST({ version: '9' }).setToken(Token)
			await rest
			.put(Routes.applicationCommands('827375161665650689'), { body: cmds })
			// .put(Routes.applicationGuildCommands('827375161665650689', '872676325838708867'), { body: cmds })
			.then(() => {
				console.log(table.toString());
				message.reply('Successfully registered all commands!');
			})
			.catch(console.error);
	},
};
