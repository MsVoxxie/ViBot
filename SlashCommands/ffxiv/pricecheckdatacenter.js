const { XIVAPIKEY, XIVCOL } = require('../../Storage/Config/Config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const XIVAPI = require('@xivapi/js');
const fetch = require('node-fetch');
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
	data: new SlashCommandBuilder()
		.setName('ffxiv_price_check_datacenter')
		.setDescription('[FFXIV] Check the price of a given item.')
		.addStringOption((option) =>
			option
				.setName('source')
				.addChoices({ name: '[Datacenter] Aether', value: 'Aether' })
				.addChoices({ name: '[Datacenter] Crystal', value: 'Aether' })
				.addChoices({ name: '[Datacenter] Primal', value: 'Aether' })
				.setDescription('Where would you like to source your prices from?')
				.setRequired(true)
		)
		.addStringOption((option) => option.setName('item').setDescription('The item to price check.').setRequired(true)),

	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		try {
			//Setup
			const Item = await interaction.options.getString('item');
			const World = await interaction.options.getString('source');
			const Data = [];

			//Get Item Search
			let response = await xiv.search(Item, { string_algo: 'match', indexes: ['Item'] });
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
				Data.push({
					price: `${entry.hq ? Vimotes['HQ'] : ''}${bot.toThousands(entry.pricePerUnit)} | x${entry.quantity}`,
					world: entry.worldName ? entry.worldName : World,
					total: `${Vimotes['GIL']} ${bot.toThousands(entry.total)}`,
					sort: entry.pricePerUnit,
					hq: entry.hq,
				});
			});
			Data.sort((a, b) => a.sort - b.sort);

			//Create embeds
			const embed = new MessageEmbed()
				.setTitle(response.name)
				.setURL(`${wiki_url}${item_name}`)
				.addFields(
					{ name: 'World', value: Data.map((w) => `[${w.world}]`).join('\n'), inline: true },
					{ name: 'Price / Quantity', value: Data.map((i) => i.price).join('\n'), inline: true },
					{ name: 'Total Price', value: Data.map((i) => i.total).join('\n'), inline: true }
				)
				.setColor(XIVCOL)
				.setThumbnail(`${api_url}${response.icon}`)
				.setFooter({ text: `• ${item_data.ItemUICategory['Name']} • ${item_data.GamePatch['ExName']} • ${item_data.GamePatch['Name']} •` });

			interaction.reply({ embeds: [embed] });
		} catch (error) {
			return interaction.reply({
				embeds: [
					bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['WARNING']} Could not find this item, please check your spelling.` }),
				],
				ephemeral: true,
			});
		}
	},
};
