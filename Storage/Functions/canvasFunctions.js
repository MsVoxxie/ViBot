const { MessageAttachment } = require('discord.js');
const Canvas = require('canvas');

module.exports = (bot) => {
	bot.createMultiColorCircle = async (colors = [], S = Number, A = Number) => {
		return new Promise(async (resolve, reject) => {
			try {
				const canvas = Canvas.createCanvas(S, S);
				const ctx = canvas.getContext('2d');
				const OffsetWidth = canvas.width / colors.length;
				const hWidth = canvas.width / 2;
				const hHeight = canvas.height / 2;
				let offset = 0;

				ctx.imageSmoothingEnabled = false;
				ctx.translate(hWidth, hHeight);
				ctx.rotate((A * Math.PI) / 180);
				ctx.translate(-hWidth, -hHeight);

				//Make it a circle!
				ctx.beginPath();
				ctx.arc(hWidth, hHeight, (hWidth + hHeight) / 2, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.clip();

				// Fill it with the colours!
				colors.reverse().forEach((color) => {
					if (color !== '#000000') {
						ctx.fillStyle = color;
						ctx.fillRect(offset, 0, canvas.width / colors.length, canvas.height);
						offset += OffsetWidth;
					}
				});

				//Rim it!
				ctx.lineWidth = (hWidth + hHeight) / 32;
				ctx.beginPath();
				ctx.arc(hWidth, canvas.height / 2, (hWidth + hHeight) / 2, 0, Math.PI * 2, true);
				ctx.stroke();

				//Create Attachment
				const attachment = new MessageAttachment(canvas.toBuffer(), 'col.png');

				resolve({ attachment: attachment, colors: colors });
			} catch (error) {
				reject(error);
			}
		});
	};
};
