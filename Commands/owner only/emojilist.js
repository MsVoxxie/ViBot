const { Util } = require('discord.js');

module.exports = {
	name: 'emojilist',
	aliases: ['el'],
	description: "Prints all of the guilds Emoji's",
	example: '',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		const list = [];

		message.guild.emojis.cache.map((em) => {
			list.push(`${em.toString()} => :${em.name}:`);
		});

		const msg = await Util.splitMessage(list.sort().join('\n'));
		msg.forEach((m) => message.channel.send(m));
	},
};
