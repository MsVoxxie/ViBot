const { MessageAttachment, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { VIAPI } = require('../../Storage/Config/Config.json');
const Canvas = require('canvas');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder().setName('palette').setDescription('Generate a randomized color palette.'),
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		//Setup button
		const Button = new MessageActionRow().addComponents(
			new MessageButton().setLabel('Generate New Palette').setStyle('PRIMARY').setCustomId('GENCOL'),
			new MessageButton().setLabel('I Like this one!').setStyle('SUCCESS').setCustomId('DONE')
		);

		//Setup Embed
		const firstColor = await createColorPalette();
		const embed = new MessageEmbed()
			.setAuthor({ name: intMember.displayName, iconURL: intMember.displayAvatarURL({ dynamic: true }) })
			.setDescription(`\`\`\`Hex Codes»\n${firstColor.colors.map((col) => col).join(' | ')}\`\`\``)
			.setImage('attachment://col.png')
			.setFooter({ text: `Endpoint» ${bot.titleCase(firstColor.endpoint)}` })
			.setColor(settings.guildcolor);
		const embedMsg = await interaction.reply({ embeds: [embed], files: [firstColor.attachment], components: [Button], fetchReply: true });

		//Listen for Interactions
		const filter = (interaction) => interaction.user.id === intMember.id;
		const collector = await embedMsg.createMessageComponentCollector({ filter, time: 300 * 1000 });
		collector.on('collect', async (interaction) => {
			// interaction.deferUpdate();
			// Switch Case
			switch (interaction.customId) {
				// New Palette
				case 'GENCOL': {
					const newColor = await createColorPalette();
					const embed = new MessageEmbed()
						.setAuthor({ name: intMember.displayName, iconURL: intMember.displayAvatarURL({ dynamic: true }) })
						.setDescription(`\`\`\`Hex Codes»\n${newColor.colors.map((col) => col).join(' | ')}\`\`\``)
						.setImage('attachment://col.png')
						.setFooter({ text: `Endpoint» ${bot.titleCase(newColor.endpoint)}` })
						.setColor(settings.guildcolor);
					await interaction.update({ embeds: [embed], files: [newColor.attachment] });
					break;
				}
				// Done
				case 'DONE': {
					await interaction.update({ components: [] });
					collector.stop();
					break;
				}
			}
		});
		//Tell users the collection ended when it has.
		collector.on('end', async () => {
			const msg = await interaction.channel.messages.fetch(embedMsg.id);
			await msg.update({ content: '**«Collection Stopped»**', components: [] });
		});
	},
};

async function createColorPalette() {
	return new Promise(async (resolve, reject) => {
		try {
			//Pick a random API to use.
			const ENDPOINT_OPTIONS = ['colormind', 'colorlovers'];
			const ENDPOINT = ENDPOINT_OPTIONS[Math.floor(Math.random() * ENDPOINT_OPTIONS.length)];

			//Get Colors
			const response = await axios.get(`${VIAPI}canvas/${ENDPOINT}`);
			const data = response.data;
			const colors = data;
			let offset = 0;

			//Create Canvas
			const canvas = Canvas.createCanvas(1024, 256);
			const OffsetWidth = canvas.width / colors.length;
			const ctx = canvas.getContext('2d');

			//Loop over Colors and add to canvas
			for (let i = 0; i < colors.length; i++) {
				let Hex = colors[i];

				//Make Colored Square 1
				ctx.fillStyle = Hex;
				ctx.fillRect(offset, 0, canvas.width / colors.length, canvas.height);

				//Center Text
				const centerText = canvas.width / colors.length / 2 + offset;

				//Add Text
				ctx.font = applyText(canvas, centerText);
				ctx.fillStyle = '#ffffff';
				ctx.strokeStyle = 'black';
				ctx.lineWidth = 1.25;
				ctx.textAlign = 'center';
				ctx.fillText(Hex.toLocaleUpperCase(), centerText, canvas.height - 10);
				ctx.strokeText(Hex.toLocaleUpperCase(), centerText, canvas.height - 10);

				offset += OffsetWidth;
			}

			//Create Attachment
			const attachment = new MessageAttachment(canvas.toBuffer(), 'col.png');

			resolve({ attachment: attachment, colors: colors, endpoint: ENDPOINT });
		} catch (error) {
			reject(error);
		}
	});
}

const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');
	let fontSize = 50;
	do {
		context.font = `${(fontSize -= 10)}px sans-serif`;
	} while (context.measureText(text).width > canvas.width - 200);

	return context.font;
};
