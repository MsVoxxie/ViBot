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
	name: 'actionsearch',
	aliases: ['as'],
	description: 'Search for an action in FFXIV',
	example: 'as cure',
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
			let response = await xiv.search(args.join(' '), { string_algo: 'match', indexes: ['Action'] });
			response = response.results[0];

            console.log(response)

			//Get Item Name and Escape spaces
			const action_name = response.name.replace(/ /g, '_');

			//Get item data from api
			const fetched_data = await fetch(`${api_url}${response.url}`)
				.then((res) => res.json())
				.then((data) => {
					return data;
				});

			const action_description = `${fetched_data.Description.split('※')[0]
                .replace(/\n\s*\n\s*\n/g, '\n\n')
				.replace(/(<([^>]+)>)/gi, '')}`

			//Create embeds
			const embed = new MessageEmbed()
				.setTitle(response.name)
				.setURL(`${wiki_url}${action_name}`)
				.setColor(XIVCOL)
				.setThumbnail(`${api_url}${response.icon}`)
				.setDescription(`${fetched_data.Description ? action_description.split('[')[0] : ''}`)
				.setFooter(`• ${bot.titleCase(fetched_data.ClassJob['Name'])} • ${fetched_data.GamePatch['ExName']} • ${fetched_data.GamePatch['Name']} •`);

			message.channel.send({ embeds: [embed] });
			if(settings.prune){
				await message.delete();
			}
			
		} catch (error) {
			return message.reply(`Unable to find action, Check usage and try again!`).then((s) => {
				if (settings.prune) setTimeout(() => s.delete(), 30 * 1000);
			});
		}
	},
};
