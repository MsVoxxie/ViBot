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
	cooldown: 2,
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
		const collector = await embedMsg.createMessageComponentCollector({ filter, time: 300 * 1000 });
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
			const response = await axios.post('http://colormind.io/api/', { model: 'default' });
			const data = response.data.result;
			const colors = [];
			let offset = 0;

			//Create Canvas
			const canvas = Canvas.createCanvas(1140, 172);
			const ctx = canvas.getContext('2d');

			//Loop over colours and add to canvas
			for (let i = 0; i < data.length; i++) {
				let Hex = ConvertRGBtoHex(data[i][0], data[i][1], data[i][2]);
				colors.push(Hex.toUpperCase());

				//Make Coloured Square 1
				ctx.fillStyle = Hex;
				ctx.fillRect(offset, 0, 228, canvas.height);

				//Add Text
				ctx.font = '40px sans-serif';
				ctx.fillStyle = '#ffffff';
				ctx.strokeStyle = 'black';
				ctx.lineWidth = 1;
				ctx.textAlign = 'center';
				ctx.fillText(Hex.toUpperCase(), offset + 13.5 * Hex.length, canvas.height - 10);
				ctx.strokeText(Hex.toUpperCase(), offset + 13.5 * Hex.length, canvas.height - 10);

				offset += 228;
			}

			//Create Attachment
			const attachment = new MessageAttachment(canvas.toBuffer(), 'col.png');

			resolve({ attachment: attachment, colors: colors }); //, color: randColor });
		} catch (error) {
			reject(error);
		}
	});
}

function ColorToHex(color) {
	var hexadecimal = color.toString(16);
	return hexadecimal.length == 1 ? '0' + hexadecimal : hexadecimal;
}

function ConvertRGBtoHex(red, green, blue) {
	return '#' + ColorToHex(red) + ColorToHex(green) + ColorToHex(blue);
}
