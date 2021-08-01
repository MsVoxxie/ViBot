const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const { StrawPollAPI } = require('../../Storage/Config/Config.json');

module.exports = {
	name: 'strawpoll',
	aliases: ['poll'],
	description: 'Create a StrawPoll in a "Question" based format.',
	example: '',
	category: 'utility',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {

		// Declarations
		let Title;
		const Options = [];
		const MsgsToDelete = [];
		let content_id;

		// Filter!
		const filter = m => m.author.id === message.author.id;

		// Setup embed
		const embed = new MessageEmbed()
			.setTitle('Poll Creator')
			.setColor(settings.guildcolor)
			.setDescription('What is the title of your poll?');

		const embMessage = await message.reply({ embed: embed });

		await embMessage.channel.awaitMessages(filter, { max: 1, time: 360 * 1000, errors: ['time'] }).then(async col => {
			Title = col.first().cleanContent;
			embed.addField('**Title›**', Title, true);
			await embMessage.edit({ embed: embed });
			MsgsToDelete.push(col.first());
		});

		embed.setDescription('Please type the options you would like the poll to have one line at a time.\nPlease say `Done` when you\'re finished.');
		await embMessage.edit({ embed: embed });

		const getOptions = await embMessage.channel.createMessageCollector(filter, { time: 700 * 1000 });
		getOptions.on('collect', async msg => {
			if (msg.cleanContent.toLowerCase() === 'done') {
				getOptions.stop();
				MsgsToDelete.push(msg);
			}
			else {
				Options.push(msg.cleanContent);
				embed.addField('**Options›**', msg.cleanContent, false);
				await embMessage.edit({ embed: embed });
				MsgsToDelete.push(msg);
			}
		});

		getOptions.on('end', async msg => {
			embed.setDescription('Wonderful, Creating your poll now, Please wait.');
			await embMessage.edit({ embed: embed });

			// Send the poll data
			await axios.post('https://strawpoll.com/api/poll',
				{
					'poll': {
						'title': Title,
						'answers': Options,
					},
				},
				{
					headers:{
						'Content-Type': 'application/json',
						'API-KEY': StrawPollAPI,
					},
				}).then(async (response) => {
				content_id = await response.data.content_id;
				console.log(response.data.content_id);
			});

			// Create new embed and clear the old with new data.
			const finalEmbed = new MessageEmbed()
				.setColor(settings.guildcolor)
				.setTitle('Poll Created!')
				.setAuthor(`${message.member.nickname ? `${message.member.nickname} | ${message.member.user.tag}` : message.member.user.tag}`, message.member.user.displayAvatarURL({ dynamic: true }))
				.setThumbnail('https://strawpoll.com/images/strawpoll/strawpoll.png')
				.setDescription(`The poll can be found at this link› https://strawpoll.com/${content_id}`);

			if(settings.audit) {
				await message.channel.bulkDelete(MsgsToDelete);
				await embMessage.delete();
				await message.delete();
			}
			await message.channel.send({ embed: finalEmbed });
		});
	},
};