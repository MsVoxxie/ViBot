const { MessageEmbed } = require('discord.js');
const { Warning } = require('../../Storage/Database/models/index.js');

module.exports = {
	name: 'warn',
	aliases: ['addwarn', 'addwarning'],
	description: 'Warn a user.',
	example: '?warn @User Broke rule #7',
	category: 'moderation',
	args: true,
	cooldown: 5,
	hidden: false,
	ownerOnly: false,
	userPerms: ['KICK_MEMBERS'],
	botPerms: ['MANAGE_MESSAGES'],
	async execute(bot, message, args, settings, Vimotes) {
		//Declarations
		const memberTarget = await (message.mentions.members.first() || message.guild.members.cache.get(args[0]));
		const reason = args.slice(1).join(' ');
		const warnDate = Date.now();
		const warningId = await bot.genUniqueId();
        const memberNick = await memberTarget.nickname || memberTarget.user.tag;

		//Checks
		if (!memberTarget) return message.reply('Please specify a user to warn.');
		if (!reason) return message.reply('Please specify a reason for the warning.');
        if(reason.length >= 256) return message.reply('Please keep reasons under 256 characters.');
		if (memberTarget.id === message.author.id) return message.reply('You cannot warn yourself.');

		//Permission Checks
		if (message.channel.permissionsFor(memberTarget).has(this.userPerms[0])) return message.reply('This user is a Mod/Admin');

		//Database Call
		const WarningCall = await Warning.create({
			guildid: message.guild.id,
			userid: memberTarget.id,
            usernick: memberNick,
			reason: `${reason ? reason : 'No Reason Provided'}`,
			warningid: warningId,
			moderator: message.author.id,
			date: warnDate,
		});
		await WarningCall.save()

		//Send Message
		const successEmbed = new MessageEmbed().setColor('#42f560').setDescription(`${Vimotes['CHECK']} ${memberTarget} has been warned.`);
		const warnedEmbed = new MessageEmbed().setColor('#f54242').setDescription(`You were warned in **${message.guild.name}**.\n**Reason:** ${reason ? reason : 'No Reason Provided'}`);

		await message.reply({embeds: [successEmbed]})
		try {
			await memberTarget.send({embeds: [warnedEmbed]})
		} catch(e) {
			console.error(e)
		}

	},
};
