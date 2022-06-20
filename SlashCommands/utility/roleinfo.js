const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roleinfo')
		.setDescription('Show information about a role')
		.addRoleOption((option) => option.setName('role').setDescription('The role to show information about').setRequired(true)),
	options: {
		ownerOnly: false,
		userPerms: [],
		botPerms: ['SEND_MESSAGES'],
	},
	async execute(bot, interaction, intGuild, intMember, settings, Vimotes) {
		const role = interaction.options.getRole('role');
		const rolecolorImage = await createColouredSquare(role.hexColor);

        //Generate Embed
        const embed = new MessageEmbed()
            .setAuthor({ name: `${role.name}'s Information`, iconURL: role.iconURL({ dynamic: true }) })
            .setColor(settings.guildcolor)
            .setDescription(`ID› \`${role.id}\`\nHex Code› \`${role.hexColor !== '#000000' ? role.hexColor : 'Transparent'}\`\nMentionable› \`${role.mentionable ? 'Yes' : 'No'}\`\nManaged› \`${role.managed ? 'Yes' : 'No'}\`\nMembers› \`${role.members.size.toString()}\`\nCreated› ${bot.relativeTimestamp(role.createdAt)}`)
			.setThumbnail('attachment://col.png')
		await interaction.reply({ files: [rolecolorImage.attachment], embeds: [embed] });
	},
};

async function createColouredSquare(hex) {
	return new Promise((resolve, reject) => {
		try {
			const canvas = Canvas.createCanvas(256, 256);
			const ctx = canvas.getContext('2d');

            //Make it a circle!
            ctx.beginPath();
            ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

			//Fill with Colour!
			if(hex !== '#000000') {
				ctx.fillStyle = hex;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}

			//Rim it!
			ctx.lineWidth = 15;
			ctx.beginPath();
			ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
			ctx.stroke();

			//Create Attachment
			const attachment = new MessageAttachment(canvas.toBuffer(), 'col.png');

			resolve({ attachment: attachment, color: hex });
		} catch (error) {
			reject(error);
		}
	});
}