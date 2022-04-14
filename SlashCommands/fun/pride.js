const { MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const jimp = require('jimp');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pridify')
		.setDescription('Add some pride flair to your avatar!')
		.addStringOption((option) =>
			option
				.setName('first_flag')
				.setDescription('The pride flag you associate with.')
				.addChoice('Agender', 'agender')
				.addChoice('Aromantic', 'aromantic')
				.addChoice('Asexual', 'asexual')
				.addChoice('Bisexual', 'bisexual')
				.addChoice('Gay', 'gay')
				.addChoice('Genderfluid', 'genderfluid')
				.addChoice('Lesbian', 'lesbian')
				.addChoice('Nonbinary', 'nonbinary')
				.addChoice('Pansexual', 'pansexual')
				.addChoice('Polyamorous', 'polyamorous')
				.addChoice('Transexual', 'transexual')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('second_flag')
				.setDescription('(Optional) The second pride flag you associate with.')
				.addChoice('Agender', 'agender')
				.addChoice('Aromantic', 'aromantic')
				.addChoice('Asexual', 'asexual')
				.addChoice('Bisexual', 'bisexual')
				.addChoice('Gay', 'gay')
				.addChoice('Genderfluid', 'genderfluid')
				.addChoice('Lesbian', 'lesbian')
				.addChoice('Nonbinary', 'nonbinary')
				.addChoice('Pansexual', 'pansexual')
				.addChoice('Polyamorous', 'polyamorous')
				.addChoice('Transexual', 'transexual')
				.setRequired(false)
		),
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: [],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		//Definitions
		const flagOne = await interaction.options.getString('first_flag');
		const flagTwo = await interaction.options.getString('second_flag');
		const borderSize = 0.04;

		// Define flags
		const prideFlags = {
			agender: ['#000000', '#BABABA', '#FFFFFF', '#B9F484', '#FFFFFF', '#BABABA', '#000000'],
			aromantic: ['#3DA542', '#A8D379', '#FFFFFF', '#A9A9A9', '#000000'],
			asexual: ['#000000', '#A3A3A3', '#FFFFFF', '#800080'],
			bisexual: ['#D60270', '#9B4F96', '#0038A8'],
			gay: ['#FF000E', '#FF5000', '#FAD220', '#138F3E', '#3558A0', '#880082'],
			genderfluid: ['#FF75A2', '#EFEFEF', '#BE18D6', '#000000', '#333EBD'],
			lesbian: ['#D52D00', '#FF9A56', '#FFFFFF', '#D362A4', '#A30262'],
			nonbinary: ['#FFF433', '#FFFFFF', '#9B59D0', '#2D2D2D'],
			pansexual: ['#FF218C', '#FFD800', '#21B1FF'],
			polyamorous: ['#0000F7', '#F70000', '#000000'],
			transexual: ['#5BCEFA', '#F5A9B8', '#EEEEEE', '#F5A9B8', '#5BCEFA'],
		};

		// Create Functions
		// Base Texture
		function createBaseTexture(colors) {
			return new Promise((resolve, reject) => {
				new jimp(1, colors.length, (error, image) => {
					if (error) return reject(error);

					image.scan(0, 0, image.bitmap.width, image.bitmap.height, (_, y, index) => {
						const colorHex = jimp.cssColorToHex(colors[y]);
						const color = jimp.intToRGBA(colorHex);

						image.bitmap.data[index] = color.r;
						image.bitmap.data[index + 1] = color.g;
						image.bitmap.data[index + 2] = color.b;
						image.bitmap.data[index + 3] = color.a;
					});
					resolve(image);
				});
			});
		}

		// Background Texture
		async function createBackgroundTexture(size, flags) {
			const textures = await Promise.all(
				flags.map((flagName) => {
					return createBaseTexture(prideFlags[flagName]);
				})
			);

			textures.forEach((texture, index) => {
				const width = size * ((index + 1) / flags.length);
				texture.resize(width, size, jimp.RESIZE_NEAREST_NEIGHBOR);
			});

			return new Promise((resolve, reject) => {
				new jimp(size, size, (error, image) => {
					if (error) return reject(error);

					for (let index = flags.length; index--; index >= 0) {
						image.blit(textures[index], 0, 0);
					}
					image.circle();
					resolve(image);
				});
			});
		}

		// createAvatar
		async function createPrideAvatar(avatarImage, flags) {
			const avatar = await jimp.read(avatarImage);
			const texture = await createBackgroundTexture(avatar.bitmap.width, flags);

			const borderOffset = avatar.bitmap.width * borderSize;
			const targetAvatarSize = avatar.bitmap.width * (1 - borderSize * 2);

			avatar.resize(targetAvatarSize, targetAvatarSize);
			avatar.circle();

			texture.blit(avatar, borderOffset, borderOffset);
			return texture;
		}

		const flags = [];
		flags.push(flagOne);
		if (flagTwo) flags.push(flagTwo);

		// Create the actual avatar of the user!
		const avatarURL = await intMember.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });
		const avatarType = (await avatarURL.includes('.gif')) ? { mime: jimp.MIME_GIF, format: '.gif' } : { mime: jimp.MIME_PNG, format: '.png' };
		const avatar = await createPrideAvatar(avatarURL, flags);
		const buffer = await avatar.getBufferAsync(avatarType.mime);
		const attachment = new MessageAttachment(buffer, `pride_avatar${avatarType.format}`);
		await interaction.reply({ content: 'Heres your Avatar!', files: [attachment] });
	},
};
