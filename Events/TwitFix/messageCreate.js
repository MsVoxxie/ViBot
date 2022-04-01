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

		//Create Collector and Filter
		const filter = (reaction, user) => reaction.emoji.name === '🐦' && user.id === message.author.id;
		const collector = message.createReactionCollector(filter, { time: 60 * 1000 });
		collector.on('collect', async (reaction, user) => {
			if (user.id === message.author.id) {
				message.delete();
				message.channel.send(`From ${message.author} | ${url.href}`);
			}
		});
	},
};
