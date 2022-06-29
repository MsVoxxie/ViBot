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
		//setup arguments
		const method = args[0];
		try {
			const rest = new REST({ version: '9' }).setToken(Token);
			switch (method) {
				case 'local':
					//Dev
					await rest.put(Routes.applicationGuildCommands('827375161665650689', '872676325838708867'), { body: bot.slashCommands.map((c) => c.data.toJSON()) }).then(() => {
						message.reply('Successfully registered my local Slash Commands!');
					});
					break;
				case 'global':
					//Global
					await rest.put(Routes.applicationCommands('827375161665650689'), { body: bot.slashCommands.map((c) => c.data.toJSON()) }).then(() => {
						message.reply('Successfully registered my global Slash Commands!');
					});
					break;
				case 'clear':
					//Clear All Commands Globally
					await rest.put(Routes.applicationGuildCommands('827375161665650689', '872676325838708867'), { body: [] });
					await rest.put(Routes.applicationCommands('827375161665650689'), { body: [] }).then(() => {
						message.reply('Successfully cleared my Slash Commands!');
					});
					break;
				default:
					//Error
					return message.reply('Invalid method.\nValid methods are:`\nlocal\nglobal\nclear`');
			}
		} catch (e) {
			console.log(e);
		}
	},
};
