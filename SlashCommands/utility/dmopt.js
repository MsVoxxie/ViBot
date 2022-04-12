const { SlashCommandBuilder } = require('@discordjs/builders');
const { userData } = require('../../Storage/Database/models/index.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('opt')
		.setDescription('Opt in or Out of DM notifications')
		.addStringOption((option) =>
			option
				.setName('choice')
				.setDescription('Opt in or out of DM notifications?')
				.addChoice('Opt In', 'true')
				.addChoice('Opt Out', 'false')
				.setRequired(true)
		),
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		// Definitions
		const choice = interaction.options.getString('choice');

		const opt = choice === 'true' ? true : false;

		//Get the user's data
		await userData
			.findOneAndUpdate(
				{ guildid: intGuild.id, userid: intMember.id },
				{
					receivedm: opt,
				},
				{ upsert: true, new: true }
			)
			.then(() => {
				interaction.reply({
					embeds: [
						bot.replyEmbed({
							color: bot.colors.success,
							text: `${Vimotes['CHECK']} You are now opted ${opt === true ? '**In** to' : '**Out** of'} DM notifications.`,
						}),
					],
					ephemeral: true,
				});
			});
	},
};
