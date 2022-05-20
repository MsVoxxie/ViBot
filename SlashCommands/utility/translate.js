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
				.addChoices({ name: 'Bulgarian', value: 'BG' })
				.addChoices({ name: 'Chinese', value: 'ZH' })
				.addChoices({ name: 'Czech', value: 'CS' })
				.addChoices({ name: 'Danish', value: 'DA' })
				.addChoices({ name: 'Dutch', value: 'NL' })
				.addChoices({ name: 'English (UK)', value: 'EN-GB' })
				.addChoices({ name: 'English (US)', value: 'EN-US' })
				.addChoices({ name: 'Estonian', value: 'ET' })
				.addChoices({ name: 'Finnish', value: 'FI' })
				.addChoices({ name: 'French', value: 'FR' })
				.addChoices({ name: 'German', value: 'DE' })
				.addChoices({ name: 'Greek', value: 'EL' })
				.addChoices({ name: 'Hungarian', value: 'HU' })
				.addChoices({ name: 'Italian', value: 'IT' })
				.addChoices({ name: 'Japanese', value: 'JA' })
				.addChoices({ name: 'Latvian', value: 'LV' })
				.addChoices({ name: 'Lithuanian', value: 'LT' })
				.addChoices({ name: 'Polish', value: 'PL' })
				.addChoices({ name: 'Portuguese', value: 'PT' })
				.addChoices({ name: 'Romanian', value: 'RO' })
				.addChoices({ name: 'Russian', value: 'RU' })
				.addChoices({ name: 'Slovak', value: 'SK' })
				.addChoices({ name: 'Slovenian', value: 'SL' })
				.addChoices({ name: 'Spanish', value: 'ES' })
				.addChoices({ name: 'Swedish', value: 'SV' })
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
