const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const GIFEncoder = require('gifencoder');
const Canvas = require('canvas');
const path = require('path');

module.exports = {
	data: new ContextMenuCommandBuilder().setName('petpet').setType(2),
	async execute(bot, interaction, intGuild, intMember, intTarget, settings, Vimotes) {
		//Get the targets Avatar
		const avatarURL = intTarget.displayAvatarURL({ format: 'png' });

		//Generate PetPet
		const petpet = await generatePetPet(avatarURL, { resolution: 128, delay: 20, backgroundColor: null });

		//Send it!
		await interaction.reply({ files: [{ name: 'petpet.gif', attachment: petpet }] });
	},
};

//Generate PetPet Function

async function generatePetPet(avatarURL, options = {}) {
	//Definitions
	const FRAMES = 10;

	const petGifCache = [];

	// Create GIF encoder
	const encoder = new GIFEncoder(options.resolution, options.resolution);

	encoder.start();
	encoder.setRepeat(0);
	encoder.setDelay(options.delay);
	encoder.setTransparent();

	// Create canvas and its context
	const canvas = Canvas.createCanvas(options.resolution, options.resolution);
	const ctx = canvas.getContext('2d');

	const avatar = await Canvas.loadImage(avatarURL);

	// Loop and create each frame
	for (let i = 0; i < FRAMES; i++) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (options.backgroundColor) {
			ctx.fillStyle = options.backgroundColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		const j = i < FRAMES / 2 ? i : FRAMES - i;

		const width = 0.8 + j * 0.02;
		const height = 0.8 - j * 0.05;
		const offsetX = (1 - width) * 0.5 + 0.1;
		const offsetY = 1 - height - 0.08;

		if (i == petGifCache.length) petGifCache.push(await Canvas.loadImage(path.resolve(__dirname, `../../Storage/Images/PetPet/pet${i}.gif`)));

		ctx.drawImage(avatar, options.resolution * offsetX, options.resolution * offsetY, options.resolution * width, options.resolution * height);
		ctx.drawImage(petGifCache[i], 0, 0, options.resolution, options.resolution);

		encoder.addFrame(ctx);
	}

	encoder.finish();
	return encoder.out.getData();
}
