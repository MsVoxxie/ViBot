const { MessageEmbed } = require('discord.js');
const { Reaction } = require('../../Storage/Database/models/');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removerole')
		.setDescription('Remove a reaction role.')
		.addStringOption((option) => option.setName('roleid').setDescription('The ReactionID you would like to delete.').setRequired(true)),
	options: {
		ownerOnly: false,
		userPerms: ['MANAGE_ROLES'],
		botPerms: ['MANAGE_ROLES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings) {

        //Check for valid options
        const reactionID = interaction.options.getString('roleid');
        const reaction = await Reaction.findOne({ guildid: intGuild.id, roleidentifier: reactionID });

        //Check if reaction exists
        if(!reaction) return interaction.reply({ content: 'The reaction role you provided does not exist.', ephemeral: true });

        //Delete reaction
        await Reaction.findOneAndDelete({ guildid: intGuild.id, roleidentifier: reactionID });

		//Create Embed
		const embed = new MessageEmbed()
			.setTitle('Reaction Role Deleted')
			.setDescription(`Reaction ID› ${reaction.roleidentifier} has been deleted.`)
			.setColor(settings.guildcolor);

		await interaction.reply({ embeds: [embed] });

	},
};
