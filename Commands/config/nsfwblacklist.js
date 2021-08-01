const { MessageEmbed } = require('discord.js');
const { Guild } = require('../../Storage/Database/models');

module.exports = {
	name: 'nsfwblacklist',
	aliases: ['nbl'],
	description: 'Add / Remove blacklisted tags to / from my NSFW Blacklist.',
	example: 'nbl gore',
	category: 'config',
	args: true,
	nsfw: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: true,
	userPerms: ['MANAGE_GUILD'],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Declarations
		const getGuild = await settings;
		const blacklist = getGuild.nsfwblacklist;

		//Print a List
		if (args[0] === 'list') {
			if (blacklist.length > 0) {
				const blacklisted = blacklist.map((tag) => tag.toUpperCase());
				const embed = new MessageEmbed()
					.setColor(settings.guildcolor)
					.setThumbnail(message.guild.iconURL({ dynamic: true, size: 64 }))
					.setTitle('NSFW Blacklist')
					.setDescription(blacklisted.join(', '));

				return message.reply({ embed });
			} else {
				return message.reply('No tags are blacklisted.').then((s) => {
					if (settings.audit) bot.setTimeout(() => s.delete(), 30 * 1000);
				});
			}
		}

		//Add or remove tags from blacklist
		if (blacklist.includes(args[0])) {
			blacklist.pull(args[0]);
			await getGuild.save();
			message.reply(`Tag ${args[0]} has been removed from the NSFW Blacklist.`);
		} else {
			blacklist.push(args[0]);
			await getGuild.save();
			message.reply(`Tag ${args[0]} has been added to the NSFW Blacklist.`);
		}
	},
};
