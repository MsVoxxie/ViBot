const fetch = require('node-fetch');
const querystring = require('querystring');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'urban',
	aliases: ['define'],
	description: 'Ask Urban Dictionary for a definition',
	example: 'Boop',
	category: 'fun',
	args: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {

		const query = querystring.stringify({ term: args.join(' ') });
		const loading = await message.reply(`${Vimotes['A_LOADING']}Finding a Definition...`);
		const { list } = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(response => response.json());
		if (!list) return message.channel.send(`No results found for **${args.join(' ')}**.`).then(s => s.delete({ timeout: 10 * 1000 }));
		const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
		const [answer] = list;

		const embed = new MessageEmbed()
			.setColor(settings.guildcolor)
			.setTitle(answer.word)
			.setURL(answer.permalink)
			.addFields(
				{ name: 'Definition', value: trim(answer.definition, 1024) },
				{ name: 'Example', value: trim(answer.example, 1024) },
				{ name: 'Rating', value: `👍 ${answer.thumbs_up} | 👎 ${answer.thumbs_down}` },
			)
			.setFooter(`Searched by › ${message.member.displayName}`);

		loading.edit('', { embed: embed });

	},
};