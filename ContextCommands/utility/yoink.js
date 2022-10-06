const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { Util, MessageAttachment } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');
const JSZip = require('jszip');
const path = require('path');
const fs = require('fs');

module.exports = {
	data: new ContextMenuCommandBuilder().setName('yoink').setType(3),
	async execute(bot, interaction, intGuild, intMember, intTarget, settings, Vimotes) {
		//Statics
		const EMOJI_REGEX = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g;
		const MEDIA_PATH = path.join(__dirname, '../../Storage/Media/Temp/');
		const USER_PATH = path.join(MEDIA_PATH, `${intMember.id}`);
		let userEmojis = new Set();
		[...intTarget.content.matchAll(EMOJI_REGEX)].map((e) => userEmojis.add(e[0]));

		//Variables
		const startedAt = Date.now();
		const totalUser = userEmojis.size;
		const totalEmoji = userEmojis.size ? userEmojis.size : 0;
		let savedEmoji = 0;
		let savedSticker = 0;
		let endedAt;

		//Save Name
		const TARGET_NAME = intTarget.author.username
			.replaceAll(/[^\w\s]/gi, '')
			.replaceAll(/ /gi, ' ')
			.replaceAll(/ /gi, '_');
		const SAVE_NAME = `${TARGET_NAME}s_Emojis.zip`;

		//Are there any emoji or stickers
		if (totalUser == 0)
			return await interaction.reply({
				embeds: [bot.replyEmbed({ color: bot.colors.warning, text: `${Vimotes['ALERT']} There are no emojis to save.` })],
				ephemeral: true,
			});

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

		//Save the zip
		zip
			.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
			.pipe(fs.createWriteStream(`${USER_PATH}/${SAVE_NAME}`))
			.on('finish', async () => {
				endedAt = Date.now();
				const difference = endedAt - startedAt;
				//Send the zip
				const attachment = new MessageAttachment(`${USER_PATH}/${SAVE_NAME}`);
				try {
					await intMember.send({
						embeds: [
							bot.replyEmbed({
								color: bot.colors.success,
								text: `${Vimotes['CHECK']} Saved\n${
									totalEmoji != 0 ? `***\`${savedEmoji}/${totalEmoji}\`*** ${totalEmoji > 1 ? 'Emojis' : 'Emoji'}\n` : ''
								}In ***\`${Math.round(difference / 1000)}\`*** seconds.`,
							}),
						],
						files: [attachment],
					});
					await interaction.reply({
						embeds: [bot.replyEmbed({ color: bot.colors.success, text: `${Vimotes['CHECK']} Sent to your DM's` })],
						ephemeral: true,
					});
				} catch (e) {
					await interaction.reply({
						embeds: [bot.replyEmbed({ color: bot.colors.error, text: `${Vimotes['XMARK']} Failed to send to your DM's` })],
						ephemeral: true,
					});
				}
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
