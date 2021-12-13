const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const XIVAPI = require('@xivapi/js');
const { XIVAPIKEY, XIVCOL } = require('../../Storage/Config/Config.json');
const xiv = new XIVAPI({
	private_key: XIVAPIKEY,
	language: 'en',
	snake_case: true,
});
const wiki_url = 'https://ffxiv.gamerescape.com/wiki/';
const api_url = 'https://XIVAPI.com';

module.exports = {
	name: 'itemsearch',
	aliases: ['is'],
	description: 'Search for an item in FFXIV',
	example: 'is bread',
	category: 'ffxiv',
	args: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		try {
			//Get Item Search
			let response = await xiv.search(args.join(' '), { indexes: ['Item'] });
			response = response.results[0];

			//Get Item Name and Escape spaces
			const item_name = response.name.replace(/ /g, '_');

			//Get item data from api
			const fetched_data = await fetch(`${api_url}${response.url}`)
				.then((res) => res.json())
				.then((data) => {
					return data;
				});

			const item_description = `${fetched_data.Description.split('※')[0]
				.replace(/(\r\n|\n|\r)/gm, '')
				.replace(/(<([^>]+)>)/gi, '')}`;

			//Logging
			// console.log(response);
			// console.log(`${wiki_url}${item_name}`, `${api_url}${response.url}`)

			//Create embeds
			const embed = new MessageEmbed()
				.setTitle(response.name)
				.setURL(`${wiki_url}${item_name}`)
				.setColor(XIVCOL)
				.setThumbnail(`${api_url}${response.icon}`)
				.setDescription(`${fetched_data.Description ? item_description.split('[')[0] : ''}`)
				.setFooter(
					`• ${fetched_data.ItemUICategory['Name']} • ${fetched_data.GamePatch['ExName']} • ${fetched_data.GamePatch['Name']}`
				);

			message.channel.send({ embeds: [embed] });
		} catch (error) {
			return message.reply(`Unable to find item, Try again and check usage!`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		}
	},
};
