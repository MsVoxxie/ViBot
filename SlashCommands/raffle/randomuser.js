const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('randomuser')
		.setDescription('Pick one or more random users')
		.addIntegerOption((option) =>
			option.setName('count').setDescription('The number of users to display').setMinValue(1).setMaxValue(10).setRequired(false)
		),
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		// Get options
		const count = interaction?.options?.getInteger('count') || 1;
		const allMembers = await intGuild.members.fetch();

		// Declarations
		let FINALMEMBERS = [];

		for (let i = 0; i < count; i++) {
			const member = allMembers.random();
			FINALMEMBERS.push(member.user.tag);
		}

		interaction.reply(FINALMEMBERS.join('\n'))
	},
};
