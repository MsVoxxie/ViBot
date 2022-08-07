const { MessageEmbed } = require('discord.js');
const { Levelroles } = require('../../Storage/Database/models/');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removelevelrole')
		.setDescription('Remove a level role.')
		.addStringOption((option) => option.setName('roleid').setDescription('The Level Role ID you would like to delete.').setRequired(true)),
	options: {
		ownerOnly: false,
		userPerms: ['MANAGE_ROLES'],
		botPerms: ['MANAGE_ROLES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings) {

        //Check for valid options
        const LevelRoleID = interaction.options.getString('roleid');
        const LevelRole = await Levelroles.findOne({ guildid: intGuild.id, roleidentifier: LevelRoleID });

        //Check if Levelroles exists
        if(!LevelRole) return interaction.reply({ content: 'The level role you provided does not exist.', ephemeral: true });

        //Delete levelRole
        await Levelroles.findOneAndDelete({ guildid: intGuild.id, roleidentifier: LevelRoleID });

		//Create Embed
		const embed = new MessageEmbed()
			.setTitle('Level Role Deleted')
			.setDescription(`Level Role ID» ${LevelRole.roleidentifier} has been deleted.`)
			.setColor(settings.guildcolor);

		await interaction.reply({ embeds: [embed] });

	},
};
