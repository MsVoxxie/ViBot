const { Statistics } = require('../../Storage/Database/models');

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
	async execute(bot, message, args, settings, Vimotes) {
		const WORDS = [];
		const Docs = await Statistics.findOne({ guildid: message.guild.id }).lean();
		for await (const word of Docs.words) { WORDS.push(word); }

		WORDS.sort((a, b) => b.count - a.count);

		console.log(WORDS);
	},
};
