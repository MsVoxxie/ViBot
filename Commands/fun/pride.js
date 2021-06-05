const { MessageAttachment } = require('discord.js');
const { MIME_PNG } = require('jimp');
const { MIME_GIF } = require('jimp');
const jimp = require('jimp');

module.exports = {
	name: 'pride',
	aliases: [],
	description: 'Pride-ify your avatar! (For multi flags just say each flag name with a space!)',
	example: 'pride gay',
	category: 'fun',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {

		// Declarations
		const borderSize = 0.04;
		const flagOptions = ['gay', 'bisexual', 'trans', 'nonbinary', 'lesbian', 'asexual', 'aromantic', 'agender', 'pansexual', 'genderfluid', 'poly', 'hamburger'];
		flagOptions.sort();
		const prideFlags = {
			gay: [ '#FF000E', '#FF5000', '#FAD220', '#138F3E', '#3558A0', '#880082' ],
			bisexual: [ '#D60270', '#9B4F96', '#0038A8' ],
			trans: [ '#5BCEFA', '#F5A9B8', '#EEEEEE', '#F5A9B8', '#5BCEFA' ],
			nonbinary: [ '#FFF433', '#FFFFFF', '#9B59D0', '#2D2D2D' ],
			lesbian: [ '#D52D00', '#FF9A56', '#FFFFFF', '#D362A4', '#A30262' ],
			asexual: [ '#000000', '#A3A3A3', '#FFFFFF', '#800080' ],
			aromantic: [ '#3DA542', '#A8D379', '#FFFFFF', '#A9A9A9', '#000000' ],
			agender: [ '#000000', '#BABABA', '#FFFFFF', '#B9F484', '#FFFFFF', '#BABABA', '#000000' ],
			pansexual: [ '#FF218C', '#FFD800', '#21B1FF' ],
			genderfluid: [ '#FF75A2', '#EFEFEF', '#BE18D6', '#000000', '#333EBD' ],
			poly: [ '#0000F7', '#F70000', '#000000' ],
			hamburger: [ '#E69138', '#8FCE00', '#F44336', '#FFD966', '#744700', '#E69138' ],
		};

		// Check if args
		if(!args.some((val) => flagOptions.indexOf(val) !== -1)) return message.lineReply(`Invalid flag name!\nHere are your options›\n\`\`\`${flagOptions.map(o => o).join('\n')}\`\`\``).then(s => {if(settings.audit) s.delete({ timeout: 30 * 1000 });});

		// Create Functions

		// Base Texture
		function createBaseTexture(colors) {
			return new Promise((resolve, reject) => {
				new jimp(1, colors.length, (error, image) => {
					if(error) return reject(error);

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
			const textures = await Promise.all(flags.map((flagName) => {
				return createBaseTexture(prideFlags[flagName]);
			}));

			textures.forEach((texture, index) => {
				const width = size * ((index + 1) / flags.length);
				texture.resize(width, size, jimp.RESIZE_NEAREST_NEIGHBOR);
			});

			return new Promise((resolve, reject) => {
				new jimp(size, size, (error, image) => {
					if(error) return reject(error);

					for(let index = flags.length; index--; index >= 0) {
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

		// Create the actual avatar of the user!
		const flags = [];
		args.forEach(o => {
			flags.push(o);
		});

		const avatarURL = await message.member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });
		const avatarType = await avatarURL.includes('.gif') ? { mime: jimp.MIME_GIF, format: '.gif' } : { mime: jimp.MIME_PNG, format: '.png' };
		const avatar = await createPrideAvatar(avatarURL, flags);
		const buffer = await avatar.getBufferAsync(avatarType.mime);
		const attachment = new MessageAttachment(buffer, `pride-avatar${avatarType.format}`);

		await message.lineReply('Here you go!', attachment).then(s => {if(settings.audit) s.delete({ timeout: 360 * 1000 });});
		await message.delete({ timeout: 360 * 1000 });
	},
};