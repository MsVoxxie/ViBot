const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const ms = require('ms');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Create an invite to this server!')
		.addNumberOption((option) =>
			option
				.setName('uses')
				.setDescription('The number of times the invite can be used. (Min 1 Max 10)')
				.setMinValue(1)
				.setMaxValue(10)
				.setRequired(true)
		),
	options: {
		cooldown: 60,
		ownerOnly: false,
		userPerms: ['SEND_MESSAGES'],
		botPerms: ['MANAGE_MESSAGES', 'CREATE_INSTANT_INVITE'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		//Checks
		if (!settings.allowinvites) return interaction.reply({ content: 'User created invites are disabled.', ephemeral: true });
		if (!settings.ruleschannel)
			return interaction.reply({ content: 'This guild does not have a proper rules channel configured.', ephemeral: true });

		//Declarations
		const arg = await interaction.options.getNumber('uses');
		const uses = bot.MinMax(arg, 1, 10) || parseInt(1);
		const inviteChannel = await intGuild.channels.cache.get(settings.ruleschannel);

		//Create Channel
		await inviteChannel
			.createInvite({
				temporary: false,
				maxAge: 3600,
				maxUses: uses,
				unique: true,
				reason: `${intMember.user.tag} used the Invite command.`,
			})
			.then((inv) => {
				const embed = new MessageEmbed()
					.setColor(settings.guildcolor)
					.setAuthor({ name: `Invite for ${intMember.displayName}`, iconURL: intMember.displayAvatarURL({ dynamic: true }) })
					.setDescription(
						`Here you go!\nThis invite will expire after ${inv.maxUses} use(s) or ${ms(ms(`${inv.maxAge}s`), {
							long: true,
						})}.\nhttps://discord.gg/${inv.code}`
					)
					.setTimestamp();
				interaction.reply({ embeds: [embed], ephimeral: true });
			});
	},
};
