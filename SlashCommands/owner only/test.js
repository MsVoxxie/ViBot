const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder().setName('test').setDescription('Testing stuff'),
	options: {
		ownerOnly: true,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		//Setup button
		const Button = new MessageActionRow().addComponents(new MessageButton().setLabel('Test Button').setStyle('PRIMARY').setCustomId('GENCOL'));

		const sent = await interaction.reply({
			content: 'Test Msg',
			components: [Button],
			fetchReply: true,
		});

		//Listen for Interactions
		const filter = (interaction) => interaction.user.id === intMember.id;
		const collector = await sent.createMessageComponentCollector({ filter, time: 300 * 1000 });
		collector.on('collect', async (interaction) => {
			interaction.update({ content: `Number: ${Math.random() * 100}` });
		});
	},
};
