const { MessageAttachment } = require('discord.js');
const xpSchema = require('../../Storage/Database/models/xp');
const Canvas = require('canvas');
const path = require('path');

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
		//Declarations
		const levelChannel = await guild.channels.cache.get(settings.levelchannel);
		//Checks
		if (!levelChannel) return;

		//Get all users in voice channels currently
		getVoiceConnectedUsers(message.guild, bot, settings, levelChannel);
	},
};

const getVoiceConnectedUsers = async (guild, bot, settings, levelChannel) => {
	console.log('cmd ran')
	if (!guild.afkChannel) return;

	//Loops
	const channels = await guild.channels.cache.filter((ch) => ch.type === 'GUILD_VOICE');
	for await (const chan of channels) {
		const channel = chan[1];
		if (channel.id === guild.afkChannelId) continue;
		const members = await channel.members;
		for await (const mem of members) {
			const member = mem[1];
			//Add XP
			await bot.addXP(guild, member, 10, bot, settings, levelChannel);
			console.log(`Giving 10 XP to ${member.displayName} for being in ${channel.name} for 10 Minutes.`)
		}
	}
};
