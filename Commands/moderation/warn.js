const mongoose = require('mongoose');
const { GuildModeration } = require('../../Storage/Database/models');

module.exports = {
	name: 'warn',
	aliases: [],
	description: 'Warn a user.',
	example: '',
	category: '',
	args: false, //Set to true later
	cooldown: 1,
	hidden: false,
	ownerOnly: true,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Setup User Schema
		const warningSchema = mongoose.Schema({
			username: {
				type: String,
				required: true,
			},
			usernick: {
				type: String,
				required: true,
			},
			userid: {
				type: String,
				required: true,
			},
			warnings: {
				type: Array,
			},
		});

		//Setup Declarations
		let Warntext = 'placeholder';
		const warnDate = Date.now();

		//Get User
		const Member = await message.mentions.members.first();
		if (!Member) return message.lineReply('Please mention a Member to warn!');

		//Get Current Guild Moderation DB
		const thisGuild = await GuildModeration.findOne({ guildid: message.guild.id });
		const guildUsers = await thisGuild.users;
		const User = false;

		//Setup New User if not found.
		if (!User) {
			const newUser = {
				username: Member.user.username,
				usernick: Member.nickname ? Member.nickname : 'None Set',
				userid: Member.id,
				warnings: [],
			};
			await guildUsers.push(newUser);
			await thisGuild.save();
		}
	},
};
