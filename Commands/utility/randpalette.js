const { MessageAttachment, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const Canvas = require('canvas');
const axios = require('axios');

module.exports = {
	name: 'randpalette',
	aliases: [],
	description: 'Generate a random color palette!',
	example: '',
	category: 'utility',
	args: false,
	cooldown: 10,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Setup button
		const Button = new MessageActionRow().addComponents(
			new MessageButton().setLabel('Generate New Palette').setStyle('PRIMARY').setCustomId('GENCOL'),
			new MessageButton().setLabel('I Like this one!').setStyle('SUCCESS').setCustomId('DONE')
		);

		//Setup Embed
		const firstColour = await createColourPalette();
		const embed = new MessageEmbed()
			.setAuthor({ name: message.member.displayName, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
			.setDescription(`\`\`\`Hex Codes›\n${firstColour.colors.map((col) => col).join(' | ')}\`\`\``)
			.setImage('attachment://col.png')
			.setColor(settings.guildcolor);
		const embedMsg = await message.reply({ embeds: [embed], files: [firstColour.attachment], components: [Button] });

		//Listen for Interactions
		const filter = (interaction) => message.author.id === interaction.user.id;
		const collector = await embedMsg.createMessageComponentCollector({ filter, time: 120 * 1000 });
		collector.on('collect', async (interaction) => {
			interaction.deferUpdate();
			// Switch Case
			switch (interaction.customId) {
				// New Palette
				case 'GENCOL': {
					const newColour = await createColourPalette();
					const embed = new MessageEmbed()
						.setAuthor({ name: message.member.displayName, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
						.setDescription(`\`\`\`Hex Codes›\n${newColour.colors.map((col) => col).join(' | ')}\`\`\``)
						.setImage('attachment://col.png')
						.setColor(settings.guildcolor);
					await embedMsg.edit({ embeds: [embed], files: [newColour.attachment] });
					break;
				}
				// Done
				case 'DONE': {
					await embedMsg.edit({ components: [] });
					break;
				}
			}
		});
		//Tell users the collection ended when it has.
		collector.on('end', async () => {
			const msg = await message.channel.messages.fetch(embedMsg.id);
			await msg.edit({ components: [] });
		});
	},
};

async function createColourPalette() {
	return new Promise(async (resolve, reject) => {
		try {
			//Get Colours
			const response = await axios.get('https://api.voxxie.me:3001/api/canvas/palette');
			const data = response.data;
			const colors = data;
			let offset = 0;

			//Create Canvas
			const canvas = Canvas.createCanvas(1024, 256);
			const OffsetWidth = canvas.width / colors.length;
			const ctx = canvas.getContext('2d');

			//Loop over colours and add to canvas
			for (let i = 0; i < colors.length; i++) {
				let Hex = `#${colors[i]}`;

				//Make Coloured Square 1
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

			resolve({ attachment: attachment, colors: colors });
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
