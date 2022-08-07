const { SlashCommandBuilder } = require('@discordjs/builders');
const { DeepL } = require('../../Storage/Config/Config.json');
const { MessageEmbed } = require('discord.js');
const translate = require('deepl');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('translate')
		.setDescription('Translate a message to another language.')
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
		)
		.addStringOption((option) => option.setName('text').setDescription('The text to Translate. (Pick One!)'))
		.addStringOption((option) => option.setName('messagelink').setDescription('The message link you want to translate. (Pick One!)')),

	options: {
		cooldown: 60,
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		//Definitions
		let text;
		const msgLink = interaction.options.getString('messagelink');
		const msgText = interaction.options.getString('text');

		if(!msgText && !msgLink) return interaction.reply({
			embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['ERROR']} Please provide either a **\`Message Link\`** or **\`Text\`** for me to translate!` })],
			ephemeral: true,
		});

		if(msgText && msgLink) return interaction.reply({
			embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['ERROR']} Please send only one **\`Message Link\`** or **\`Text\`** for me to translate!` })],
			ephemeral: true,
		});

		// Get the message
		if (msgLink) {
			const msgChan = await intGuild.channels.fetch(msgLink.split('/').slice(5)[0]);
			const msg = await msgChan.messages.fetch(msgLink.split('/').slice(5)[1]);
			text = msg.content;
		} else if (msgText) {
			text = msgText;
		}

		//Get Language
		const lang = interaction.options.getString('language');

		// Translate
		await translate({
			free_api: true,
			text: text,
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
				.addField(`📥 Input» ${response.detected_source_language}`, `\`\`\`\n${text}\`\`\`\n`, false)
				.addField(`📤 Output» ${lang}`, `\`\`\`\n${response.text}\`\`\``, false);
			interaction.reply({ embeds: [embed] });
		});
	},
};
