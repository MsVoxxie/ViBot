const backup = require('discord-backup');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'create-backup',
	aliases: ['cbu'],
	description: "Create a backup of the Entire guild, It's Messages, Roles, Permissions, Icon, Name, ETC.",
	example: '',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: true,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Create a Backup
		try {
			console.log(`${message.author.tag} has created a backup of the guild ${message.guild.name}`);
			await backup
				.create(message.guild, {
					maxMessagesPerChannel: 100,
					jsonSave: true,
					jsonBeautify: true,
					saveImages: 'base64',
				})
				.then((data) => {
					console.log('Completed!');
					const embed = new MessageEmbed()
						.setColor(settings.guildcolor)
						.setTitle(`Backup Created`)
						.setDescription(
							`**Backup created for ${message.guild.name}!**\n**Backup ID›** ${data.id}\n**To Use›** Invite me into a fresh server and run \`?load-backup ${data.id}\``
						);

					try {
						message.member.send({ embeds: [embed] });
					} catch (e) {
						message.reply({ embeds: [embed] });
					}
				});
		} catch (e) {
			try {
				message.member.send('An Error occurred! Backup not created!');
			} catch (e) {
				message.reply('An Error occurred! Backup not created!');
			}
		}
	},
};
