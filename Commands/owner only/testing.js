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
		let baseWords = message.content.toLowerCase();
		const AsciiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
		const DiscordRegex = /(<a?)?:\w+:(\d{18}>)?/gi;

		// Trim down any white spaces and clean string
		baseWords = baseWords.replace(DiscordRegex, '').replace(AsciiRegex, '');
		let splitWords = baseWords.split(/ +/);
		splitWords.map((w) => w.trim());
		splitWords = splitWords.filter(item => item);
		console.log(splitWords);

		return;
		for await (const uWord of splitWords) {
			let hasDoc = await Statistics.countDocuments({ guildid: message.guild.id, words: { $elemMatch: { word: uWord } } });
			console.log(hasDoc);
			if (hasDoc > 0) {
				await Statistics.updateOne(
					{ guildid: message.guild.id, words: { $elemMatch: { word: uWord } } },
					{
						guildid: message.guild.id,
						$inc: { 'words.$.count': 1 },
					}
				);
			} else {
				hasDoc = await Statistics.countDocuments({ guildid: message.guild.id, words: [] });
				if (hasDoc > 0) {
					await Statistics.create({ guildid: message.guild.id, words: [] });
				} else {
					await Statistics.findOneAndUpdate(
						{ guildid: message.guild.id },
						{ $push: { words: { word: uWord, count: 1 } } },
						{ upsert: true }
					).then(() => {
						console.log(`Saved: ${uWord}`);
					});
				}
			}
			// if (hasDoc > 0) {
			// 	await Statistics.updateOne({ guildid: message.guild.id, uWord }, { $inc: { words: [{ count: 1 }] } });
			// } else {
			// 	await Statistics.findOneAndUpdate(
			// 		{ guildid: message.guild.id, words: [{ word: uWord }] },
			// 		{ $push: { words: [{ word: uWord, count: 1 }] } },
			// 		{ upsert: true }
			// 	);
			// }
		}
	},
};
