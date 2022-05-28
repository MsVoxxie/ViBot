const { BotData } = require('../../Storage/Database/models/index.js');

module.exports = {
	name: 'restart',
	aliases: [],
	description: 'Restarts the bot',
	example: '',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		try {
			// Define last message and such
			const myMessage = await message.reply(`${Vimotes['A_LOADING']} Restarting...`);

			await BotData.findOneAndUpdate(
				{},
				{
					restartdata: {
						restarted: true,
						guild: message.guild.id,
						channel: message.channel.id,
						message: myMessage.id,
					},
				},
				{ upsert: true, new: true }
			);

			process.exit(1);
		} catch (error) {
			console.error(error);
		}
	},
};
