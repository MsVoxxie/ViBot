const { MessageAttachment, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const Canvas = require('canvas');

module.exports = {
	name: 'randcolor',
	aliases: [],
	description: 'Generate a random color!',
	example: '',
	category: 'utility',
	args: false,
	cooldown: 2,
	hidden: false,
	ownerOnly: false,
	userPerms: [],
	botPerms: [],
	async execute(bot, message, args, settings, Vimotes) {
		//Setup Button
		const Button = new MessageActionRow().addComponents(
			new MessageButton().setLabel('Generate New Color').setStyle('PRIMARY').setCustomId('GENCOL'),
			new MessageButton().setLabel('I Like this one!').setStyle('SUCCESS').setCustomId('DONE')
		);

		//Setup Embed
		const firstColour = await createColouredSquare();
		const embed = new MessageEmbed()
			.setAuthor({ name: message.member.displayName, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
			.setDescription(`\`\`\`Hex Code› ${firstColour.color}\`\`\``)
			.setImage('attachment://col.png')
			.setColor(settings.guildcolor);
		const embedMsg = await message.reply({ embeds: [embed], files: [firstColour.attachment], components: [Button] });

		//Listen for Interactions
		const filter = (interaction) => message.author.id === interaction.user.id;
		const collector = await embedMsg.createMessageComponentCollector({ filter, time: 300 * 1000 });
		collector.on('collect', async (interaction) => {
			interaction.deferUpdate();
			// Switch Case
			switch (interaction.customId) {
				// Backwards
				case 'GENCOL': {
					const newColour = await createColouredSquare();
					const embed = new MessageEmbed()
						.setDescription(`\`\`\`Hex Code› ${newColour.color}\`\`\``)
						.setImage('attachment://col.png')
						.setColor(settings.guildcolor);
					await embedMsg.edit({ embeds: [embed], files: [newColour.attachment] });
					break;
				}
				// Done
				case 'DONE': {
					await embedMsg.edit({ components: [] });
					break;
				}
			}
		});
		//Tell users the collection ended when it has.
		collector.on('end', async () => {
			const msg = await message.channel.messages.fetch(embedMsg.id);
			await msg.edit({ content: '**«Collection Stopped»**', components: [] });
		});
	},
};

async function createColouredSquare(args) {
	return new Promise((resolve, reject) => {
		try {
			const randColor = `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`.toUpperCase();
			const canvas = Canvas.createCanvas(512, 512);
			const ctx = canvas.getContext('2d');

			//Make Coloured Square
			ctx.fillStyle = randColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			//Add Text
			ctx.font = '90px sans-serif';
			ctx.fillStyle = '#ffffff';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 3;
			ctx.textAlign = 'center';
			ctx.fillText(randColor, canvas.width / 2, canvas.height / 1.1);
			ctx.strokeText(randColor, canvas.width / 2, canvas.height / 1.1);

			//Create Attachment
			const attachment = new MessageAttachment(canvas.toBuffer(), 'col.png');

			resolve({ attachment: attachment, color: randColor });
		} catch (error) {
			reject(error);
		}
	});
}
