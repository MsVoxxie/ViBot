const { Util, MessageAttachment } = require('discord.js');
const axios = require('axios');
const JSZip = require('jszip');
const path = require('path');
const fs = require('fs');

module.exports = {
	name: 'emojisave',
	aliases: ['esave'],
	description: 'Save the guilds emojis to a zip file',
	example: '',
	category: 'moderation',
	args: false,
	cooldown: 0,
	hidden: false,
	ownerOnly: false,
	userPerms: ['MANAGE_EMOJIS_AND_STICKERS'],
	botPerms: ['SEND_MESSAGES', 'ATTACH_FILES'],
	async execute(bot, message, args, settings, Vimotes) {
		//Statics
		const EMOJI_REGEX = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g;
		const MEDIA_PATH = path.join(__dirname, '../../Storage/Media/Temp/');
		const USER_PATH = path.join(MEDIA_PATH, `${message.author.id}`);
		const guildStickers = await message.guild.stickers?.cache;
		const guildEmojis = await message.guild.emojis?.cache;
		let userEmojis = new Set();
		[...args.join(' ').matchAll(EMOJI_REGEX)].map((e) => userEmojis.add(e[0]));

		//Variables
		const startedAt = Date.now();
		const totalUser = userEmojis.size;
		const totalEmoji = userEmojis.size ? userEmojis.size : guildEmojis.size;
		const totalSticker = guildStickers.size;
		let savedEmoji = 0;
		let savedSticker = 0;
		let endedAt;

		//Save Name
		const SAVE_NAME = totalUser > 0 ? `Hand_Picked_Emojis.zip` : `${message.guild.name}_Emojis.zip`;

		//Are there any emoji or stickers
		if (totalEmoji > 0 && totalSticker > 0 && totalUser > 0) return message.reply('There are no emoji or stickers to save.');

		//Let the user know we are starting
		await message.react(Vimotes['A_LOADING']);

		//Create a temp folder for the user
		try {
			if (!fs.existsSync(USER_PATH)) {
				fs.mkdirSync(USER_PATH, { recursive: true });
			}
		} catch (error) {
			console.log(error);
		}

		// Get user input and save to disk
		if (totalUser > 0) {
			fs.mkdirSync(`${USER_PATH}/CustomEmojis/`, { recursive: true });
			for (const emoji of userEmojis) {
				const emojiData = Util.parseEmoji(emoji);
				const emojiName = emojiData.name;
				const emojiId = emojiData.id;
				const emojiExt = emojiData.animated ? 'gif' : 'png';
				const emojiUri = `https://cdn.discordapp.com/emojis/${emojiId}.${emojiExt}`;
				await download(emojiUri, `${USER_PATH}/CustomEmojis/`, emojiName, emojiExt);
				savedEmoji++;
			}
		}

		// Get the guilds emojis and save to disk
		if (guildEmojis && !totalUser > 0) {
			fs.mkdirSync(`${USER_PATH}/Emojis/`, { recursive: true });
			for await (const emoticon of guildEmojis) {
				const emoji = emoticon[1];
				const ext = emoji.url.split('.').pop();
				await download(emoji.url, `${USER_PATH}/Emojis/`, emoji.name, ext);
				savedEmoji++;
			}
		}

		//Get the guilds stickers and save to disk
		if (guildStickers && totalSticker > 0 && !totalUser > 0) {
			fs.mkdirSync(`${USER_PATH}/Stickers/`, { recursive: true });
			for await (const stick of guildStickers) {
				const sticker = stick[1];
				const ext = sticker.url.split('.').pop();
				await download(sticker.url, `${USER_PATH}/Stickers/`, sticker.name, ext);
				savedSticker++;
			}
		}

		//Read newly saved files
		const zip = new JSZip();

		//Add user emojis to zip
		if (totalUser > 0) {
			const savedUserEmojis = fs.readdirSync(`${USER_PATH}/CustomEmojis/`);
			const UserEmojifolder = zip.folder(`Hand Picked Emojis`);
			for (const Emoji of savedUserEmojis) {
				try {
					const file = fs.readFileSync(`${USER_PATH}/CustomEmojis/${Emoji}`);
					UserEmojifolder.file(Emoji, file);
				} catch (error) {
					console.log(error);
				}
			}
		}

		//Add Guild Emojis to zip
		if (guildEmojis && !totalUser > 0) {
			const savedEmojis = fs.readdirSync(`${USER_PATH}/Emojis/`);
			const Emojifolder = zip.folder(`${message.guild.name}'s Emojis`);
			for await (const Emoji of savedEmojis) {
				try {
					const emojiData = fs.readFileSync(`${USER_PATH}/Emojis/${Emoji}`);
					Emojifolder.file(Emoji, emojiData);
				} catch (error) {
					console.error(error);
				}
			}
		}

		//Add Guild Stickers to zip
		if (guildStickers && totalSticker > 0 && !totalUser > 0) {
			const savedStickers = fs.readdirSync(`${USER_PATH}/Stickers/`);
			const Stickerfolder = zip.folder(`${message.guild.name}'s Stickers`);
			for await (const Sticker of savedStickers) {
				try {
					const stickerData = fs.readFileSync(`${USER_PATH}/Stickers/${Sticker}`);
					Stickerfolder.file(Sticker, stickerData);
				} catch (error) {
					console.error(error);
				}
			}
		}

		//Save the zip
		zip
			.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
			.pipe(fs.createWriteStream(`${USER_PATH}/${SAVE_NAME}`))
			.on('finish', async () => {
				endedAt = Date.now();
				const difference = endedAt - startedAt;
				//Send the zip
				const attachment = new MessageAttachment(`${USER_PATH}/${SAVE_NAME}`);
				await message?.reactions?.removeAll();
				await message.reply({ embeds: [ bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Saved\n***\`${savedEmoji}/${totalEmoji}\`*** ${ totalEmoji > 1 ? 'Emojis' : 'Emoji' }\n***\`${savedSticker}/${totalSticker}\`*** ${totalSticker > 1 ? 'Stickers' : 'Sticker'}\nIn ***\`${Math.round( difference / 1000 )}\`*** seconds.`, }), ], files: [attachment], });
				//Delete the zip
				fs.rmSync(`${USER_PATH}/${SAVE_NAME}`);
				//Delete the temp folder
				fs.rmSync(USER_PATH, { recursive: true });
			});
	},
};

async function download(uri, filepath, filename, extension) {
	try {
		//Variables
		let exists = false;
		let i = 0;

		//Check if the file exists
		if (!fs.existsSync(filepath)) return;
		if (fs.existsSync(`${filepath}/${filename}.${extension}`)) {
			exists = true;
			i++;
		}
		//Write file
		const file = fs.createWriteStream(`${filepath}/${filename}${exists === true ? `~${i}` : ''}.${extension}`);
		const request = await axios.get(uri, { responseType: 'stream' });
		request.data.pipe(file);
		file.on('finish', () => {
			file.close();
		});
	} catch (e) {
		console.error(e);
	}
}
