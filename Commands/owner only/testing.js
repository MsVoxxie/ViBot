const { MessageButton, MessageActionRow } = require('discord.js');

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
		//Setup Dashboard Roles
		const Buttons = new MessageActionRow().addComponents(
			new MessageButton().setLabel('Approve').setStyle('SUCCESS').setCustomId('approve'),

			new MessageButton().setLabel('Deny').setStyle('DANGER').setCustomId('deny')
		);

		await message.channel.send({ content: 'BlahBlah', components: [Buttons] });

		const filter = (interaction) => {
			if (interaction.user.id === message.author.id) return true;
			return;
		};

		const collector = message.channel.createMessageComponentCollector({ filter, max: 1 });

		collector.on('end', async (ButtonInteraction) => {
			const btnId = ButtonInteraction.first().customId;

			switch (btnId) {
				case 'approve':
					ButtonInteraction.first().reply({ content: 'Approved' });
					ButtonInteraction.first().message.edit({ components: [] });

					break;

				case 'deny':
					ButtonInteraction.first().reply({ content: 'Denied' });
					ButtonInteraction.first().message.edit({ components: [] });

					break;
			}
		});
	},
};
