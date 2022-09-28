const { MessageEmbed, MessageButton, MessageActionRow, MessageAttachment } = require('discord.js');
const { Client } = require('craiyon');
const craiyon = new Client();
module.exports = {
	name: 'aiart',
	aliases: ['aia'],
	description: 'Generate art via an Artificial Intelligence',
	example: 'cat in a tophat',
	category: 'fun',
	args: true,
	cooldown: 60,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		// Variables
		const embeds = [];
		let currentPage = 0;

		//Loading
		const loading = await message.reply(`${Vimotes['A_LOADING']}Generating image results...`);
		const results = await craiyon.generate({
			prompt: args.join(' '),
		});

		results._images.forEach((res) => {
			//Get image from buffer
			const image = res.base64;
			const sfbuff = new Buffer.from(image, 'base64');
			const attachment = new MessageAttachment(sfbuff, `AiGen.png`);

			//Gen Embed
			const embed = new MessageEmbed()
				.setColor(settings.guildcolor)
				.setAuthor({
					name: `${message.member.nickname ? message.member.nickname : message.member.user.username}`,
					iconURL: message.member.user.displayAvatarURL({ dynamic: true }),
				})
				.setImage('attachment://AiGen.png');

			embeds.push({ embed, attachment });
			return embeds;
		});

		// Send pagination
		const embedList = await loading.edit({
			content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}»**`,
			embeds: [embeds[currentPage].embed],
			files: [embeds[currentPage].attachment],
		});

		// Apply Reactions
		try {
			const Buttons = new MessageActionRow().addComponents(
				new MessageButton().setLabel('Back').setStyle('SUCCESS').setCustomId('BACK'),
				new MessageButton().setLabel('Stop').setStyle('DANGER').setCustomId('STOP'),
				new MessageButton().setLabel('Cancel').setStyle('DANGER').setCustomId('CANCEL'),
				new MessageButton().setLabel('Next').setStyle('SUCCESS').setCustomId('NEXT')
			);
			await embedList.edit({ components: [Buttons] });
		} catch (e) {
			console.error(e);
		}

		// Filter Reactions, setup Collector and try each reaction
		const filter = (interaction) => message.author.id === interaction.user.id;
		const collector = await embedList.createMessageComponentCollector({ filter, time: 300 * 1000 });
		collector.on('collect', async (interaction) => {
			await interaction.deferUpdate();
			// Switch Case
			switch (interaction.customId) {
				// Backwards
				case 'BACK': {
					if (currentPage !== 0) {
						currentPage--;
						embedList.edit({
							content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}»**`,
							embeds: [embeds[currentPage].embed],
							files: [embeds[currentPage].attachment],
						});
					}
					break;
				}

				// Stop
				case 'STOP': {
					collector.stop();
					embedList.edit({ content: '**«Collection Stopped»**', components: [] });
					break;
				}

				// Cancel
				case 'CANCEL': {
					await embedList.delete();
					collector.stop();
					break;
				}

				// Forwards
				case 'NEXT': {
					if (currentPage < embeds.length - 1) {
						currentPage++;
						embedList.edit({
							content: `**«Current Page» ‹${currentPage + 1} / ${embeds.length}»**`,
							embeds: [embeds[currentPage].embed],
							files: [embeds[currentPage].attachment],
						});
					}
					break;
				}
			}
		});
		//Tell users the collection ended when it has.
		collector.on('end', async () => {
			if (embedList.length) {
				await embedList.edit({ content: '**«Collection Stopped»**', components: [] });
			}
		});
	},
};
