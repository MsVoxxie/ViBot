const { MessageAttachment } = require('discord.js');
const xpSchema = require('../../Storage/Database/models/xp');
const Canvas = require('canvas');
const path = require('path');

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


		const users = await xpSchema.find({}).lean();
		console.log(users);


		return
		//Calculate needed xp
		const getNeededXP = (level) => level * level * 100;

		//Get users of guild
		// let users = await xpSchema.find({ guildid: message.guild.id }).lean();
		users.sort((a, b) => b.level - a.level);

		//Sort, Rank, Return
		for (let i = 0; i < users.length; i++) {
			let rank = users[i].level;
			let usersWithRank = users.filter((user) => user.level === rank);
			for (let user of usersWithRank) {
				user.rank = i + 1;
			}
			i += usersWithRank.length - 1;
		}

		//Get the member who requested their rank
		let me = await users.find((user) => user.memberid === message.member.user.id);
		
		//Generate Image
		const canvas = Canvas.createCanvas(800, 200);
		const context = canvas.getContext('2d');
		const background = await Canvas.loadImage(path.resolve(__dirname, '../../Storage/Images/background.png'));

		//Add Background
		context.drawImage(background, 0, 0, canvas.width, canvas.height);

		//Text
		context.strokeStyle = '#0099ff';
		context.strokeRect(0, 0, canvas.width, canvas.height);

		context.font = '28px sans-serif';
		context.fillStyle = '#ffffff';
		context.fillText('Profile', canvas.width / 2.5, canvas.height / 3.5);

		context.font = applyText(canvas, `${message.member.displayName}!`);
		context.fillStyle = '#ffffff';
		context.fillText(`${message.member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);

		//Add Avatar
		const avatar = await Canvas.loadImage(message.member.displayAvatarURL({ format: 'png' }));

		//Make Avatar Circular
		context.beginPath();
		context.arc(125, 125, 80, 0, Math.PI * 2, true);
		context.closePath();
		context.clip();

		//Draw it
		context.drawImage(avatar, 25, 25, 200, 200);


		//Send
		const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');
		message.reply({files: [attachment]})

	},
};

const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');
	let fontSize = 70;

	do {
		context.font = `${fontSize -= 10}px sans-serif`;
	} while (context.measureText(text).width > canvas.width - 300);

	return context.font;
};