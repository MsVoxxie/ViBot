const { MessageEmbed } = require('discord.js');
const mcUtil = require('minecraft-server-util');

module.exports = {
	name: 'c25',
	aliases: [],
	description: 'Checks if the Creation 2.5 server status.',
	example: '',
	category: 'other',
	args: false,
	cooldown: 0,
	hidden: true,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		if (settings.audit) {
			setTimeout(() => message.delete(), 30 * 1000);
		}

		mcUtil
			.status('167.114.48.196')
			.then((response) => {
				const host = response.host;
				const port = '25565';
				const version = response.version;
				const totalMods = response.rawResponse.forgeData['mods'].length;
				const onlineCount = response.onlinePlayers;
				const maxPlayers = response.maxPlayers;
				const players = response.samplePlayers;
				const srvDesc = response.description['descriptionText'];

				const embed = new MessageEmbed()
					.setColor(settings.guildcolor)
					.setTitle(`Creation 2.5 Server - Is Online!`)
					.setDescription(`**Connection Info›** ${host}:${port}\n**Player Count›** ${onlineCount}/${maxPlayers}`)
					.addField('Connected Players›', `${players.length ? players.map((p) => p.name).join('\n') : 'No Players Online'}`)
					.setFooter({ text: `MC Ver - ${version} | Mod Count - ${totalMods}` })
					.setTimestamp(new Date());

				message.channel.send({ embeds: [embed] }).then((s) => {
					if (settings.prune) setTimeout(() => s.delete(), 60 * 1000);
				});
			})
			.catch((err) => {
				const embed = new MessageEmbed().setColor(settings.guildcolor).setTitle(`Creation 2.5 Server - Is Offline!`).setTimestamp(new Date());
				message.channel.send({ embeds: [embed] }).then((s) => {
					if (settings.prune) setTimeout(() => s.delete(), 60 * 60 * 1000);
				});
			});
	},
};
