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
			await message.lineReply('Restarting.');
			process.exit(1);
		}
		catch (error) {
			console.error(error);
		}
	},
};