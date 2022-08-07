const { userData } = require('../../Storage/Database/models/index.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const ms = require('ms');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reminder')
		.setDescription('Set a reminder for your self')
		.addStringOption((option) => option.setName('time').setDescription('Time from now to be reminded.').setRequired(true))
		.addStringOption((option) =>
			option
				.setName('interval')
				.setDescription('Minutes, days, weeks?.')
				.addChoices({ name: 'Minutes', value: 'minutes' })
				.addChoices({ name: 'Hours', value: 'hours' })
				.addChoices({ name: 'Days',  value:'days' })
				.addChoices({ name: 'Weeks', value: 'weeks' })
				.addChoices({ name: 'Months', value: 'months' })
				.addChoices({ name: 'Years', value: 'years' })
				.setRequired(true)
		)
		.addStringOption((option) => option.setName('message').setDescription('Message to be reminded').setRequired(true)),
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		const time = interaction.options.getString('time');
		const interval = interaction.options.getString('interval');
		const message = interaction.options.getString('message');
		const fromNow = moment().add(time, interval);

		await userData.findOneAndUpdate(
			{ guildid: intGuild.id, userid: intMember.id },
			{
				$addToSet: {
					reminders: {
						id: bot.genUniqueId(),
						time: fromNow,
						message: message,
					},
				},
			},
			{
				upsert: true,
				new: true,
			}
		);

		return interaction.reply({
			embeds: [
				bot.replyEmbed({
					color: bot.colors.success,
					text: `${Vimotes['CHECK']} I will remind you»\n\`\`\`${message}\`\`\`\n${bot.relativeTimestamp(fromNow)}`,
				}),
			],
			ephemeral: true,
		});
	},
};
