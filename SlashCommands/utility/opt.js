const { SlashCommandBuilder } = require('@discordjs/builders');
const { userData } = require('../../Storage/Database/models/index.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('opt')
		.setDescription('Opt in or Out of certain features')

		// Role DM's
		.addSubcommand(subcommand => subcommand
		.setName('roledm')
		.setDescription('Opt in or out of receiving direct messages when assigned a role')
		.addStringOption((option) => option
			.setName('choice')
			.setDescription('Opt in or out of receiving direct messages when assigned a role')
			.addChoices({ name: 'Receive DM\'s', value: 'true' })
			.addChoices({ name: 'Don\'t Receive DM\'s', value: 'false' })
		.setRequired(true)))

		// Auto Embed
		.addSubcommand(subcommand => subcommand
		.setName('autoembed')
		.setDescription('Opt in or out of automatic embedding')
		.addStringOption((option) => option
			.setName('choice')
			.setDescription('Opt in or out of automatic embedding')
			.addChoices({ name: 'Automatic', value: 'true' })
			.addChoices({ name: 'Manual', value: 'false' })
		.setRequired(true))),
		
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {

		// Role DM's
		if (interaction.options.getSubcommand() === 'roledm') {
			// Definitions
			const choice = interaction.options.getString('choice');
			const opt = choice === 'true' ? true : false;
			//Get the user's data
			await userData.findOneAndUpdate({ guildid: intGuild.id, userid: intMember.id }, { receivedm: opt }, { upsert: true, new: true }).then(async () => {
				await interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} You are now opted ${opt === true ? '**In** to' : '**Out** of'} DM notifications.`, }), ], ephemeral: true, });
				console.log(`${intMember.displayName} has opted ${opt === true ? 'in' : 'out'} to receive DM notifications.`);
			});
		}

		// Auto Embed
		if (interaction.options.getSubcommand() === 'autoembed') {
			// Definitions
			const choice = interaction.options.getString('choice');
			const opt = choice === 'true' ? true : false;
			//Get the user's data
			await userData.findOneAndUpdate({ guildid: intGuild.id, userid: intMember.id }, { autoembed: opt }, { upsert: true, new: true }).then(async () => {
				await interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} You are now opted ${opt === true ? '**In** to' : '**Out** of'} automatic embedding.`, }), ], ephemeral: true, });
				console.log(`${intMember.user.tag} opted ${opt === true ? 'in' : 'out'} to automatic embedding.`);
			});
		}

	},
};
