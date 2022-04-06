const { SlashCommandBuilder } = require('@discordjs/builders');
const { Warning } = require('../../Storage/Database/models/index.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delwarn')
		.setDescription('Deletes a users warning by ID.')
		.addStringOption((option) => option.setName('warningid').setDescription('The warning to delete').setRequired(true)),
	options: {
		ownerOnly: false,
		userPerms: ['KICK_MEMBERS'],
		botPerms: ['MANAGE_MESSAGES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
        //Check for valid ID
        const warningId = await interaction.options.getString('warningid');
        if(!warningId && warningId.length !== 32) return interaction.reply({ embeds: [bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} Invalid warning ID.` })] });

        //Get Warning
		const userWarning = await Warning.find({ guildid: intGuild.id, warningid: warningId }).lean();
        if(!userWarning[0]) return interaction.reply({ embeds: [bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} No warning with that ID.` })] });

        //Get Member
		const member = await intGuild.members.fetch(userWarning[0].userid);

        //Delete, and send message
		await Warning.findOneAndDelete({ guildid: intGuild.id, warningid: warningId });
		await interaction.reply({ embeds: [bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} **${member.user.tag}'s** Warning has been deleted.\n**Warning ID:** ${warningId}` })] });

        try {
            await member.send({ embeds: [bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} One of your warnings in **${intGuild.name}** has been removed.` })] });
        } catch(e) {
            console.error(e)
        }
    },
};
