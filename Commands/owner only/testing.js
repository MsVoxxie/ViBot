const { Vimotes } = require('../../Storage/Functions/miscFunctions');
const { MessageAttachment } = require('discord.js');
const Canvas = require('canvas');
const axios = require('axios');

module.exports = {
	name: 'test',
	aliases: ['t'],
	description: 'testing',
	example: 'testing',
	category: 'owner only',
	args: false,
	cooldown: 2,
	hidden: true,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings) {
		const image = await createColourPalette();
		message.channel.send({ files: [image.attachment] });
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
				console.log(Hex.length);
				ctx.fillText(Hex.toUpperCase(), offset + (13.5 * Hex.length), canvas.height - 10);
				ctx.strokeText(Hex.toUpperCase(), offset + (13.5 * Hex.length), canvas.height - 10);

				offset += 228;
			}

			//Create Attachment
			const attachment = new MessageAttachment(canvas.toBuffer(), 'col.png');

			resolve({ attachment: attachment }); //, color: randColor });
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
