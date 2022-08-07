const wd = require('word-definition');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'define',
	aliases: [],
	description: 'Ask Wiktionary for a definition',
	example: 'Spooge',
	category: 'fun',
	args: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		const query = args.join(' ');

		wd.getDef(query, 'en', null, async function (definition) {
			const loading = await message.reply(`${Vimotes['A_LOADING']} Finding a Definition...`);
			const answer = definition;

			if (!answer.definition)
				return await loading.edit(`${Vimotes['ERROR']} Failed to find a result.`).then((s) => {
					if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
				});

			const embed = new MessageEmbed()
				.setColor(settings.guildcolor)
				.addFields({ name: 'Word', value: bot.trim(answer.word, 1024) }, { name: 'Category', value: bot.trim(answer.category, 1024) }, { name: 'Definition', value: bot.trim(answer.definition, 1024) })
				.setFooter({ text: `Searched by » ${message.member.displayName}` });

			await loading.edit({ content: null, embeds: [embed] });
		});
	},
};
