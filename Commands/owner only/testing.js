module.exports = {
	name: 'test',
	aliases: ['t'],
	description: 'testing',
	example: 'testing',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: true,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings) {
		const msg = await message.channel.send('testing');
		await msg.react('💩');

		const filter = (reaction, user) =>
			['💩'].includes(reaction.emoji.name) && user.id === message.author.id;
		const collector = await msg.createReactionCollector({ filter, time: 5000 });
		collector.on('collect', (reaction, user) => {
			console.log(reaction.emoji.name);
		});
	},
};
