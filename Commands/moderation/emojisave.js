const { MessageAttachment } = require('discord.js');
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
    cooldown: 120,
    hidden: false,
    ownerOnly: false,
    userPerms: ['MANAGE_EMOJIS_AND_STICKERS'],
    botPerms: ['SEND_MESSAGES', 'ATTACH_FILES'],
	async execute(bot, message, args, settings, Vimotes) {
		//Statics
		const guildEmojis = await message.guild.emojis?.cache;
		const guildStickers = await message.guild.stickers?.cache;
		const MEDIA_PATH = path.join(__dirname, '../../Storage/Media/Temp/');
		const USER_PATH = path.join(MEDIA_PATH, `${message.author.id}/`);

		//Variables
		const startedAt = Date.now();
		const totalEmoji = guildEmojis.size;
		const totalSticker = guildStickers.size;
		let savedEmoji = 0;
		let savedSticker = 0;
		let endedAt;

		//Are there any emoji or stickers
		if (totalEmoji < 1 && totalSticker < 1) return;

		//Let the user know we are starting
		await message.react(Vimotes['A_LOADING']);

		//Create a temp folder for the user
		try {
			if (!fs.existsSync(USER_PATH)) {
				fs.mkdirSync(USER_PATH, { recursive: true });
				fs.mkdirSync(`${USER_PATH}/Emojis/`, { recursive: true });
				fs.mkdirSync(`${USER_PATH}/Stickers/`, { recursive: true });
			}
		} catch (error) {
			console.log(error);
		}

		// Get the guilds emojis and save to disk
		if (guildEmojis) {
			for await (const emoticon of guildEmojis) {
				const emoji = emoticon[1];
				const ext = emoji.url.split('.').pop();
				await download(emoji.url, `${USER_PATH}/Emojis/`, emoji.name, ext);
				savedEmoji++;
			}
		}

		//Get the guilds stickers and save to disk
		if (guildStickers) {
			for await (const stick of guildStickers) {
				const sticker = stick[1];
				const ext = sticker.url.split('.').pop();
				await download(sticker.url, `${USER_PATH}/Stickers/`, sticker.name, ext);
				savedSticker++;
			}
		}

		//Read newly saved files
		const zip = new JSZip();
		const savedEmojis = fs.readdirSync(`${USER_PATH}/Emojis/`);
		const savedStickers = fs.readdirSync(`${USER_PATH}/Stickers/`);
		const Emojifolder = zip.folder(`${message.guild.name}'s Emojis`);
		const Stickerfolder = zip.folder(`${message.guild.name}'s Stickers`);

		//Add Emojis to zip
		for await (const Emoji of savedEmojis) {
			try {
				const emojiData = fs.readFileSync(`${USER_PATH}/Emojis/${Emoji}`);
				Emojifolder.file(Emoji, emojiData);
			} catch (error) {
				console.error(error);
			}
		}

		//Add Stickers to zip
		for await (const Sticker of savedStickers) {
			try {
				const stickerData = fs.readFileSync(`${USER_PATH}/Stickers/${Sticker}`);
				Stickerfolder.file(Sticker, stickerData);
			} catch (error) {
				console.error(error);
			}
		}

		//Save the zip
		zip
			.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
			.pipe(fs.createWriteStream(`${USER_PATH}/${message.guild.name}_Emojis_and_Stickers.zip`))
			.on('finish', async () => {
				endedAt = Date.now();
				const difference = endedAt - startedAt;
				//Send the zip
				const attachment = new MessageAttachment(`${USER_PATH}/${message.guild.name}_Emojis_and_Stickers.zip`);
				await message?.reactions?.removeAll();
				await message.reply({
					embeds: [
						bot.replyEmbed({
							color: bot.colors.success,
							text: `${Vimotes['CHECK']} Saved\n***\`${savedEmoji}/${totalEmoji}\`*** ${totalEmoji > 1 ? 'Emojis' : 'Emoji'}\n***\`${savedSticker}/${totalSticker}\`*** ${totalSticker > 1 ? 'Stickers' : 'Sticker'}\nIn ***\`${Math.round( difference / 1000 )}\`*** seconds.`,
						}),
					],
					files: [attachment],
				});
				//Delete the zip
				fs.rmSync(`${USER_PATH}/${message.guild.name}_Emojis_and_Stickers.zip`);
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
		if(fs.existsSync(`${filepath}/${filename}.${extension}`)) {
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
	} catch(e) {
		console.error(e);
	}
}