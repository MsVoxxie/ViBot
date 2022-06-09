const { userData } = require('../../Storage/Database/models/index.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthday')
		.setDescription('Add your birthday to the database!')
		.addStringOption((option) =>
			option
				.setName('month')
				.setDescription('The month of your birthday.')
				.addChoices({ name: 'January',  value: '01' })
				.addChoices({ name: 'February',  value: '02' })
				.addChoices({ name: 'March',  value: '03' })
				.addChoices({ name: 'April',  value: '04' })
				.addChoices({ name: 'May',  value: '05' })
				.addChoices({ name: 'June',  value: '06' })
				.addChoices({ name: 'July',  value: '07' })
				.addChoices({ name: 'August',  value: '08' })
				.addChoices({ name: 'September',  value: '09' })
				.addChoices({ name: 'October',  value: '10' })
				.addChoices({ name: 'November',  value: '11' })
				.addChoices({ name: 'December', value: '12' })
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
		botPerms: ["SEND_MESSAGES"],
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
