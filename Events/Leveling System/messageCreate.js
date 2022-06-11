const { userData } = require('../../Storage/Database/models/');

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
		if (bot.isBottomText(message)) {
			await userData.findOneAndUpdate( { guildid: message.guild.id, userid: message.author.id, }, { $inc: { bottomcount: 1, }, }, { upsert: true, new: true, } );
			return console.log(`[${message.guild.name}] ${message.author.tag}: Bottom`);
		}

		const { guild, member } = message;
		const settings = await bot.getGuild(guild);
		const verifyChannelID = await settings.verifychannel;
		if(message.channel.id === verifyChannelID) return;
		const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
		const xpadd = clamp(Math.round(Math.random() * message.content.length), 1, 100);
		
		//Check
		if (bot.isCmdorAlias(message) === true) return;
		const levelChannel = await guild.channels.cache.get(settings.levelchannel);
		if (!levelChannel) return;

		//Add XP
		await bot.addXP(guild, member, xpadd, bot, settings, levelChannel, message);
		if (bot.Debug) console.log(`Granting ${xpadd} XP to ${member.user.tag}`);
	},
};
