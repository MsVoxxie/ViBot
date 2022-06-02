const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('overlay')
		.setDescription('Various overlay options!')
		.addStringOption((option) =>
			option
				.setName('overlay')
				.setDescription('Which overlay would you like?')
				.addChoices({ name: 'Blur', value: 'blur' })
				.addChoices({ name: 'Comrade', value: 'comrade' })
				.addChoices({ name: 'Glass', value: 'glass' })
				.addChoices({ name: 'Horny', value: 'horny' })
				.addChoices({ name: 'Jail', value: 'jail' })
				.addChoices({ name: 'Mission Passed', value: 'passed' })
				.addChoices({ name: 'Pixelate', value: 'pixelate' })
				.addChoices({ name: 'Simpcard', value: 'Simpcard' })
				.addChoices({ name: 'Triggered', value: 'triggered' })
				.addChoices({ name: 'Wasted', value: 'wasted' })
				.setRequired(true)
		)
		.addUserOption((option) => option.setName('user').setDescription("The user's avatar to show")),

	options: {
		cooldown: 2,
		ownerOnly: false,
		userPerms: [],
		botPerms: ['SEND_MESSAGES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {

        //Get Target
		const intuser = (await interaction.options.getUser('user')) || intMember;
		const member = await intGuild.members.fetch(intuser.id);

        //Get Overlay
        const overlay = await interaction.options.getString('overlay');

		//Fetch request
		const response = await fetch(
			`https://some-random-api.ml/canvas/${overlay}?${new URLSearchParams({ avatar: member.displayAvatarURL({ format: 'png' }) }).toString()}`
		);
		
        //Send Result
        const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setAuthor({ name: `${bot.titleCase(overlay)} for ${member.displayName}`, iconURL: member.displayAvatarURL({ dynamic: true }) })
			.setDescription(`[Click here to view the raw image](${response.url})`)
			.setImage(response.url)
			.setFooter({ text: `Requested by ${intMember.displayName}` });

		return interaction.reply({ embeds: [embed] });
	},
};
