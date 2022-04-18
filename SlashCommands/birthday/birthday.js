const { userData } = require('../../Storage/Database/models/index.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthday')
		.setDescription('Add your birthday to the database!')
		.addStringOption((option) =>
			option
				.setName('month')
				.setDescription('The month of your birthday.')
				.addChoice('January', '01')
				.addChoice('February', '02')
				.addChoice('March', '03')
				.addChoice('April', '04')
				.addChoice('May', '05')
				.addChoice('June', '06')
				.addChoice('July', '07')
				.addChoice('August', '08')
				.addChoice('September', '09')
				.addChoice('October', '10')
				.addChoice('November', '11')
				.addChoice('December', '12')
				.setRequired(true)
		)
		.addNumberOption((option) =>
			option
				.setName('day')
				.setDescription('The day of your birthday.')
				.setMinValue(1)
				.setMaxValue(31)
				.setRequired(true)
		),
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		//Definitions
		const month = await interaction.options.getString('month');
		const day = await interaction.options.getNumber('day');
        if(day > 31 || day < 1) return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} Please enter a valid day between 1 and 31.` }) ], ephemeral: true });
		const date = `${Number(month)}/${Number(day)}`;
        const Birthday = Date.parse(date);
        const humanDate = new Date(date);
        await userData.findOneAndUpdate({ guildid: intGuild.id, userid: intMember.id }, { birthday: Birthday }, { upsert: true, new: true });
        return interaction.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Your birthday has been updated to **${moment(humanDate).format('MMMM Do')}**.` }) ], ephemeral: false });
	},
};
