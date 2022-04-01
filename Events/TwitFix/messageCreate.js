module.exports = {
	name: 'messageCreate',
	disabled: false,
	once: false,
	async execute(message, bot) {
		// If Partial, Fetch
		if (message.partial) {
			await message.fetch();
		}

		//Declarations
		if (message.author.bot) return;
		if (!message.content.startsWith('https://twitter.com/')) return;

		//Create new url
		const url = new URL(message);
		url.hostname = 'fxtwitter.com';
		await message.react('🐦');

		//Create Filter
		const filter = (reaction, user) => reaction.emoji.name === '🐦' && user.id === message.author.id;
		const collector = message.createReactionCollector({ filter, time: 60 * 1000, error: ['time'] });

		//Collector Collects
		collector.on('collect', async (reaction, user) => {
			message.delete();
			message.channel.send(`Original post by ${message.author}\n${url.href}`);
		});

		//Collector Ends
		collector.on('end', async (collected, reason) => {
			if (reason === 'time') {
				await message.reactions.cache.first().users.remove(bot.user.id);
			}
		});
	},
};
