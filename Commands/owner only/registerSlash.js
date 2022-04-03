const { readdirSync } = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Token } = require('../../Storage/Config/Config.json');

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
		readdirSync('./SlashCommands/').forEach(async (dir) => {
			const cmds = [];
			const commands = readdirSync(`./SlashCommands/${dir}/`).filter((file) => file.endsWith('.js'));
			for await (const file of commands) {
				const command = require(`../../SlashCommands/${dir}/${file}`);
				cmds.push(command.data.toJSON());
			}

			const rest = new REST({ version: '9' }).setToken(Token);
			rest
				.put(Routes.applicationCommands('827375161665650689'), { body: cmds })
				// .put(Routes.applicationGuildCommands('827375161665650689', '872676325838708867'), { body: cmds })

				.then(() => console.log('Successfully registered application commands.'))
				.catch(console.error);
		});
	},
};
