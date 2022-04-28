const { SlashCommandBuilder } = require('@discordjs/builders');
const { DeepL } = require('../../Storage/Config/Config.json');
const { MessageEmbed } = require('discord.js');
const translate = require('deepl');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('translate')
		.setDescription('Translate a message to another language.')
		.addStringOption((option) => option.setName('messagelink').setDescription('The message link you want to translate.').setRequired(true))
		.addStringOption((option) =>
			option
				.setName('language')
				.setDescription('Language to translate into.')
				.addChoice('Bulgarian', 'BG')
				.addChoice('Chinese', 'ZH')
				.addChoice('Czech', 'CS')
				.addChoice('Danish', 'DA')
				.addChoice('Dutch', 'NL')
				.addChoice('English (UK)', 'EN-GB')
				.addChoice('English (US)', 'EN-US')
				.addChoice('Estonian', 'ET')
				.addChoice('Finnish', 'FI')
				.addChoice('French', 'FR')
				.addChoice('German', 'DE')
				.addChoice('Greek', 'EL')
				.addChoice('Hungarian', 'HU')
				.addChoice('Italian', 'IT')
				.addChoice('Japanese', 'JA')
				.addChoice('Latvian', 'LV')
				.addChoice('Lithuanian', 'LT')
				.addChoice('Polish', 'PL')
				.addChoice('Portuguese', 'PT')
				.addChoice('Romanian', 'RO')
				.addChoice('Russian', 'RU')
				.addChoice('Slovak', 'SK')
				.addChoice('Slovenian', 'SL')
				.addChoice('Spanish', 'ES')
				.addChoice('Swedish', 'SV')
				.setRequired(true)
		),

	options: {
		cooldown: 60,
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		// Get the message
		const msgLink = interaction.options.getString('messagelink').split('/').slice(5);
		const msgChan = await intGuild.channels.fetch(msgLink[0]);
		const msg = await msgChan.messages.fetch(msgLink[1]);
		const message = msg.content;

		//Get Language
		const lang = interaction.options.getString('language');

		// Translate
		await translate({
			free_api: true,
			text: message,
			target_lang: lang,
			auth_key: DeepL,
		}).then((t) => {
			const response = t.data.translations[0];

			//Create Embed
			const embed = new MessageEmbed()
				.setColor(settings.guildcolor)
				.setAuthor({
					name: `Translated by DeepL`,
					iconURL: 'https://is3-ssl.mzstatic.com/image/thumb/Purple115/v4/97/e4/99/97e49907-7fdf-57c9-ee01-3b20d055a875/source/512x512bb.jpg',
				})
				.addField(`📥 Input› ${response.detected_source_language}`, `\`\`\`\n${message}\`\`\`\n`, false)
				.addField(`📤 Output› ${lang}`, `\`\`\`\n${response.text}\`\`\``, false);
			interaction.reply({ embeds: [embed] });
		});
	},
};
