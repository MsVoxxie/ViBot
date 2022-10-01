const { MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const jimp = require('jimp');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('seasonify')
		.setDescription('Add some seasonal flair to your avatar!')
		.addStringOption((option) =>
			option
				.setName('season')
				.setDescription('The season you would like!')
				.addChoices({ name: 'Patriotic', value: 'patriotic' })
				.addChoices({ name: 'Autumn', value: 'autumn' })
				.addChoices({ name: 'Easter', value: 'easter' })
				.addChoices({ name: 'Valentines Day', value: 'valentines' })
				.addChoices({ name: 'St. Patrick\'s Day', value: 'pattiesday' })
				.addChoices({ name: 'Christmas', value: 'christmas' })
				.addChoices({ name: 'Halloween', value: 'halloween' })
				.addChoices({ name: 'Hanukkah', value: 'hanukkah' })
				.addChoices({ name: 'Kwanzaa', value: 'kwanzaa' })
				.setRequired(true)
		),
	options: {
		cooldown: 10,
		ownerOnly: false,
		userPerms: [],
		botPerms: ['SEND_MESSAGES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		//Definitions
		const season = await interaction.options.getString('season');
		const borderSize = 0.04;

		// Define flags
		const seasonalFlags = {
			patriotic: ['#CC2F2F', '#FFFFFF', '#2F5ECC'],
			autumn: ['#59200F', '#8F2323', '#A7532D', '#BC7535', '#CC9D3A'],
			easter: ['#ECC3E2', '#D5C3F2', '#B7E4EE', '#d1EC9F', '#F2DfA6'],
			valentines: ['#C00000', '#FF3334', '#FF6F77', '#FFBBC1', '#FFDEE3', '#FF8896'],
			pattiesday: ['#06B500', '#F28600', '#F2F2F2', '#F28600', '#06B300'],
			christmas: ['#E52222', '#981A1A', '#184E07', '#0C8228', '#FFFEFE'],
			halloween: ['#FE8000', '#EFBD76', '#FFA52B', '#363636', '#000000'],
			hanukkah: ['#F2EBDB', '#9AB8C2', '#3A56A0', '#F2CD3C', '#DAAE4B'],
			kwanzaa: ['#D50F20', '#101010', '#12732E'],
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
					return createBaseTexture(seasonalFlags[flagName]);
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
		flags.push(season);

		// Create the actual avatar of the user!
		const avatarURL = await intMember.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });
		const avatarType = (await avatarURL.includes('.gif')) ? { mime: jimp.MIME_GIF, format: '.gif' } : { mime: jimp.MIME_PNG, format: '.png' };
		const avatar = await createPrideAvatar(avatarURL, flags);
		const buffer = await avatar.getBufferAsync(avatarType.mime);
		const attachment = new MessageAttachment(buffer, `seasonal_avatar${avatarType.format}`);
		await interaction.reply({ content: 'Heres your Avatar!', files: [attachment] });
	},
};
