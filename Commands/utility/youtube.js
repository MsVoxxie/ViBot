const { MessageButton, MessageActionRow } = require('discord.js');
const { Google_API } = require('../../Storage/Config/Config.json');
const axios = require('axios');

module.exports = {
	name: 'youtube',
	aliases: ['yt'],
	description: 'Seach youtube for something!',
	example: 'youtube Pizza Pasta',
	category: 'utility',
	args: true,
	cooldown: 25,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: ['SEND_MESSAGES'],
	async execute(bot, message, args, settings, Vimotes) {
		//Get Search Query
		const Videos = [];
		let currentPage = 0;
		const searchQuery = args.join(' ');
		const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${Google_API}&type=video&part=snippet&maxResults=10&q=${searchQuery}`);
		const Results = response.data.items;

		for await (const r of Results) {
			const Video = r;
			Videos.push(`https://youtu.be/${Video.id.videoId}`);
		}

		//Setup Buttons
		const Buttons = new MessageActionRow().addComponents(
			new MessageButton().setLabel('Back').setStyle('SUCCESS').setCustomId('BACK'),
			new MessageButton().setLabel('Stop').setStyle('DANGER').setCustomId('STOP'),
			new MessageButton().setLabel('Cancel').setStyle('DANGER').setCustomId('CANCEL'),
			new MessageButton().setLabel('Next').setStyle('SUCCESS').setCustomId('NEXT')
		);

		const Message = await message.reply({
			content: `**«Current Page» ‹${currentPage + 1} / ${Videos.length}»**\n${Videos[0]}`,
			components: [Buttons],
		});

		//Listen for Interactions
		const filter = (interaction) => message.author.id === interaction.user.id;
		const collector = await Message.createMessageComponentCollector({ filter, time: 300 * 1000 });
		collector.on('collect', async (interaction) => {
			await interaction.deferUpdate();
			// Switch Case
			switch (interaction.customId) {
				// Backwards
				case 'BACK': {
					if (currentPage !== 0) {
						currentPage--;
						Message.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${Videos.length}»**\n${Videos[currentPage]}`, components: [Buttons] });
					}
					break;
				}

				// Stop
				case 'STOP': {
					collector.stop();
					Message.edit({ content: `**«Collection Stopped»**\n${Videos[currentPage]}`, components: [] });
					break;
				}

				// Cancel
				case 'CANCEL': {
					await Message.delete();
					collector.stop();
					break;
				}

				// Forwards
				case 'NEXT': {
					if (currentPage < Videos.length - 1) {
						currentPage++;
						Message.edit({ content: `**«Current Page» ‹${currentPage + 1} / ${Videos.length}»**\n${Videos[currentPage]}`, components: [Buttons] });
					}
					break;
				}
			}
		});
		//Tell users the collection ended when it has.
		collector.on('end', async () => {
			if (Message.length) {
				await Message.edit({ content: '**«Collection Stopped»**', components: [] });
			}
			message?.delete();
		});
	},
};
