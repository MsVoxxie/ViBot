const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = {
	name: 'invite',
	aliases: ['inv'],
	description: 'Generate a guild invite!',
	example: 'invite',
	category: 'utility',
	args: false,
	cooldown: 15,
	hidden: false,
	ownerOnly: false,
	userPerms: ['SEND_MESSAGES'],
	botPerms: ['MANAGE_MESSAGES', 'CREATE_INSTANT_INVITE'],
	async execute(bot, message, args, settings, Vimotes) {
		//Checks
		if (!settings.allowinvites) return message.reply('User created invites are disabled.');
		if (!settings.ruleschannel) return message.reply('This guild does not have a proper rules channel configured.');
		//Declarations
		const uses = bot.MinMax(args[0], 1, settings.invitelimit) || parseInt(1);
		const inviteChannel = message.guild.channels.cache.get(settings.ruleschannel);

		//Create Channel
		await inviteChannel
			.createInvite({
				temporary: false,
				maxAge: 3600,
				maxUses: uses,
				unique: true,
				reason: `${message.member.user.tag}used the Invite command.`,
			})
			.then((inv) => {
				const embed = new MessageEmbed()
					.setColor(settings.guildcolor)
					.setAuthor({ name: `Invite for ${message.member.displayName}`, iconURL: message.member.displayAvatarURL({ dynamic: true })})
					.setDescription(`Here you go!\nThis invite will expire after ${inv.maxUses} use(s) or ${ms(ms(`${inv.maxAge}s`), { long: true })}.\nhttps://discord.gg/${inv.code}`)
					.setTimestamp();
				message.channel.send({ embeds: [embed] }).then((s) => {
					if (settings.prune) {
						setTimeout(() => s.delete(), 3600 * 1000);
					}
				});
			});
	},
};
