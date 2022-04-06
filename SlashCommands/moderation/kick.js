const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kicks a user from the server.')
		.addUserOption((option) => option.setName('user').setDescription('The user to kick').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('The reason for kicking the user').setRequired(true)),
	options: {
		ownerOnly: false,
		userPerms: ['KICK_MEMBERS'],
		botPerms: ['KICK_MEMBERS'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		// Definitions
		const member = await intGuild.members.fetch(interaction.options.getUser('user').id);
		const reason = interaction.options.getString('reason');

		//Dont kick yourself...
		if(member.id === intMember.id) return interaction.reply({
			embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['XMARK']} You cannot kick yourself.` })],
			ephemeral: true,
		});

		//Check if the user is kickable
		if (!member.kickable || member.permissions.has('KICK_MEMBERS'))
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['XMARK']} I cannot kick ${member}` })],
				ephemeral: true,
			});

		//Kick the user
		try {
			await member.kick(reason);
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Kicked ${member}.` })],
				ephemeral: true,
			});
		} catch (err) {
			return interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['XMARK']} I could not kick ${member}.` })],
				ephemeral: true,
			});
		}
	},
};
