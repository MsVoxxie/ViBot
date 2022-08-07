module.exports = {
	name: 'messageReactionAdd',
	disabled: false,
	once: false,
	async execute(msg, user, bot, Vimotes) {
		if (msg.message.partial) {
			await msg.message.fetch();
		}
		if (user.bot) return;

		//Declare variables
		const SAUCE_REACTION = '🍝';
		const settings = await bot.getGuild(msg.message.guild);
		const REGEX = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|png))/i;
		msg.message.requester = user;

		//Check for valid reaction
		if (msg.emoji.name.toString() !== SAUCE_REACTION) return;

		await msg?.message?.reactions?.removeAll();

		//Check for attachments
		if (msg.message.attachments.size > 0) {
			await bot.commands.get('sauce').execute(bot, msg.message, [], settings);
		}

		// Otherwise.. check for content
		if (!(msg.message.attachments.size > 0)) {
			const Match = msg.message.content.match(REGEX);
			if (!Match) return;
			if (Match[0]) {
				await bot.commands.get('sauce').execute(bot, msg.message, [], settings);
			}
		}
	},
};
