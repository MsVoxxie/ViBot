const backup = require('discord-backup');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'load-backup',
	aliases: ['lbu'],
	description: "Load a backup of the Entire guild, It's Messages, Roles, Permissions, Icon, Name, ETC.",
	example: '',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: true,
	ownerOnly: true,
	userPerms: ['MANAGE_GUILD'],
	botPerms: ['MANAGE_GUILD'],
	async execute(bot, message, args, settings, Vimotes) {
		//Declarations
		const BackupID = args[0];

		//Load a Backup
		try {
			console.log(`${message.author.tag} has loaded a backup of the guild ${message.guild.name}`);
			await backup.load(BackupID, message.guild).then((data) => {
				console.log('Completed!');
				const embed = new MessageEmbed()
					.setColor(settings.guildcolor)
					.setTitle(`Backup Loaded!`)
					.setDescription(`Backup ID: ${BackupID} Has successfully been loaded!`);

				try {
					message.member.send({ embeds: [embed] });
				} catch (e) {
					message.reply({ embeds: [embed] });
				}
			});
		} catch (e) {
			try {
				message.member.send('An Error occurred! Backup not Loaded!');
			} catch (e) {
				message.reply('An Error occurred! Backup not Loaded!');
			}
		}
	},
};
