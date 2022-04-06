const { MessageEmbed } = require('discord.js');
const { Warning } = require('../../Storage/Database/models/index.js');

module.exports = {
	name: 'warning',
	aliases: ['warnings', 'getwarn', 'getwarns', 'warns'],
	description: 'Get a users warnings.',
	example: 'warnings @User',
	category: 'moderation',
	args: false,
	cooldown: 5,
	hidden: false,
	ownerOnly: false,
	userPerms: ['KICK_MEMBERS'],
	botPerms: ['MANAGE_MESSAGES'],
	async execute(bot, message, args, settings, Vimotes) {
		//Declarations
		const memberTarget = await (message.mentions.members.first() || message.guild.members.cache.get(args[0]));
		const warningId = args[`${memberTarget ? 1 : 0}`];

		//Get all of a users warnings
		if ((memberTarget && !warningId) || !warningId.length === 32) {
			const userWarnings = await Warning.find({ guildid: message.guild.id, userid: memberTarget.id }).limit(10).lean();
			userWarnings.sort((a, b) => a.date - b.date);
			if(!userWarnings.length) return message.reply('This user has no warnings.');

			//Setup Embed
			const listEmbed = new MessageEmbed().setColor(settings.guildcolor).setAuthor({ name: `${userWarnings.length} Warnings for ${memberTarget.user.tag}`, iconURL: memberTarget.displayAvatarURL({ dynamic: true }) });

			//Add Warnings to Embed
			let counter = 0;
			for await (const warning of userWarnings) {
				//Increasing Counter
				counter++;
				//Get the moderator who warned the user
				const moderator = await message.guild.members.fetch(warning.moderator);
				//Add Fields
				listEmbed.addField(`${counter} | Moderator: ${moderator.user.tag}`,`**Nickname:** ${warning.usernick}\n**Reason:** ${warning.reason}\n**Date:** ${bot.Timestamp(warning.date)}\n**Warning ID:** ${warning.warningid}`);
			}

			//Send Embed
			await message.channel.send({ embeds: [listEmbed] });
		}

		//Get the warning by ID
		if (!memberTarget && warningId && warningId.length === 32) {
			//Get Warning
			const userWarning = await Warning.find({ guildid: message.guild.id, warningid: warningId });
			if(!userWarning[0]) return message.reply('That warning does not exist.');
			//Get the user
			const member = await message.guild.members.fetch(userWarning[0].userid);
			//Get the moderator who warned the user
			const moderator = await message.guild.members.fetch(userWarning[0].moderator);

			//Setup Embed
			const singleEmbed = new MessageEmbed().setColor(settings.guildcolor)
            .setAuthor({ name: `Warning for ${member.user.tag}`, iconURL: member.displayAvatarURL({ dynamic: true }) })
            .addField(`Moderator: ${moderator.user.tag}`,`**Nickname:** ${userWarning[0].usernick}\n**Reason:** ${userWarning[0].reason}\n**Date:** ${bot.Timestamp(userWarning[0].date)}\n**Warning ID:** ${userWarning[0].warningid}`);

			//Send Embed
			await message.channel.send({ embeds: [singleEmbed] });
		}
	},
};
