const { userData } = require('../../Storage/Database/models/index.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removebirthday')
		.setDescription('Remove your birthday from the database!'),
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
        await userData.findOneAndUpdate({ guildid: intGuild.id, userid: intMember.id }, { birthday: "null" }, { upsert: true, new: true });
        return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Your birthday has been removed.` }) ], ephemeral: false });
	},
};
