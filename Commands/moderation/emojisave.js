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
		const guildEmojis = await message.guild.emojis.cache;
		const MEDIA_PATH = path.join(__dirname, '../../Storage/Media/Temp/');
		const USER_PATH = path.join(MEDIA_PATH, `${message.author.id}/`);

		//Variables
		const startedAt = Date.now();
		const totalEmoji = guildEmojis.size;
		let savedEmoji = 0;
		let endedAt;

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

		//Get the guilds emojis and save to disk
		for await (const emoticon of guildEmojis) {
			const emoji = emoticon[1];
			const ext = emoji.url.split('.').pop();
			await download(emoji.url, USER_PATH, `${emoji.name}.${ext}`, (e) => console.log(e));
		}

		//Read newly saved files
		const savedEmojis = fs.readdirSync(USER_PATH);
		savedEmoji = savedEmojis.length;
		const zip = new JSZip();
		const folder = zip.folder(`${message.guild.name}'s Emojis`);

		//Add the files to the zip
		for await (const Emoji of savedEmojis) {
			const emojiData = fs.readFileSync(`${USER_PATH}/${Emoji}`);
			folder.file(Emoji, emojiData);
		}

		//Save the zip
		zip
			.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
			.pipe(fs.createWriteStream(`${USER_PATH}/Emojis.zip`))
			.on('finish', async () => {
				endedAt = Date.now();
				const difference = endedAt - startedAt;
				//Send the zip
				const attachment = new MessageAttachment(`${USER_PATH}/Emojis.zip`);
				await message?.reactions?.removeAll();
				await message.reply({
					embeds: [
						bot.replyEmbed({
							color: bot.colors.success,
							text: `${Vimotes['CHECK']} Saved ***\`${savedEmoji}/${totalEmoji}\`*** ${totalEmoji > 1 ? 'Emojis' : 'Emoji'} in ***\`${Math.round( difference / 1000 )}\`*** seconds.`,
						}),
					],
					files: [attachment],
				});
				//Delete the zip
				fs.rmSync(`${USER_PATH}/Emojis.zip`);
				//Delete the temp folder
				fs.rmSync(USER_PATH, { recursive: true });
			});
	},
};

async function download(uri, filepath, filename, callback) {
	if (!fs.existsSync(filepath)) return;
	const file = fs.createWriteStream(`${filepath}/${filename}`);
	const request = await axios.get(uri, { responseType: 'stream' });
	request.data.pipe(file);
	file.on('finish', () => {
		file.close();
		callback(`${filename} saved to ${filepath}`);
	});
}