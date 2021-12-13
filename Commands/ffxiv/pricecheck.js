const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const ascii = require('ascii-table');
const priceTable = new ascii().setHeading('Quantity / Price', 'Total Price');
const XIVAPI = require('@xivapi/js');
const { XIVAPIKEY, XIVCOL } = require('../../Storage/Config/Config.json');
const xiv = new XIVAPI({
	private_key: XIVAPIKEY,
	language: 'en',
	snake_case: true,
});
//URLS
const wiki_url = 'https://ffxiv.gamerescape.com/wiki/';
const price_url = 'https://universalis.app/api/';
const api_url = 'https://XIVAPI.com';

module.exports = {
	name: 'pricecheck',
	aliases: ['pc'],
	description: "Search for an item's price in FFXIV",
	example: 'pc Mateus shallows cod',
	category: 'ffxiv',
	args: true,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		try {
			//Setup
			const Props = args.join(' ');
			const splitProps = Props.split(' ');
			const Item = splitProps.slice(1).join(' ');
			const World = splitProps[0];
            const Data = [];

			// return console.log(`World: ${World}\nItem: ${Item}`)

			//Get Item Search
			let response = await xiv.search(Item, { indexes: ['Item'] });
			response = response.results[0];

			//Get Item Name and Escape spaces
			const item_name = response.name.replace(/ /g, '_');
			const item_id = response.id;

			//Get item data from api
			const item_price = await fetch(`${price_url}/${World}/${item_id}?listings=10`)
				.then((res) => res.json())
				.then((data) => {
					return data;
				});
			const item_data = await fetch(`${api_url}${response.url}`)
				.then((res) => res.json())
				.then((data) => {
					return data;
				});

            //Generate Description
			item_price.listings.forEach((entry) => {
                Data.push({price: `${entry.hq ? Vimotes['HQ'] : ''}${bot.toThousands(entry.pricePerUnit)} ${Vimotes['GIL']} x${entry.quantity} [${World}]`, total: `${Vimotes['GIL']} ${bot.toThousands(entry.total)}`, sort: entry.pricePerUnit, hq: entry.hq})
            })
            Data.sort((a, b) => a.sort - b.sort)

			//Create embeds
			const embed = new MessageEmbed()
				.setTitle(response.name)
				.setURL(`${wiki_url}${item_name}`)
				.addField('Quantity / Price', Data.map(i => i.price).join('\n'),true)
                .addField('Total Price', Data.map(i => i.total).join('\n'),true)
				.setColor(XIVCOL)
				.setThumbnail(`${api_url}${response.icon}`)
				.setFooter(`• ${item_data.ItemUICategory['Name']} • ${item_data.GamePatch['ExName']} • ${item_data.GamePatch['Name']} •`);
                
			message.channel.send({ embeds: [embed] });
		} catch (error) {
			return message.reply(`Unable to find item, Try again and check usage!`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		}
	},
};
