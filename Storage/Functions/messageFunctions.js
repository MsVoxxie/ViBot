module.exports = (bot) => {
	bot.messageMedia = async (message) => {
		return new Promise((resolve, reject) => {
			if (!message) return reject('No message provided');

			const REGEX = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|png))/gi;

			const ContentImages = [...message.content?.matchAll(REGEX)].map((m) => m[0]);
			const AttachmentImages = message.attachments?.map((a) => a.url);
			const EmbedImages = message.embeds?.map((e) => e.image?.url);

			//Data Output
			const Data = {
				content: {
					images: ContentImages,
				},
				attachments: {
					images: AttachmentImages,
				},
				embed: {
					images: EmbedImages,
				},
			};

			resolve(Data);
		});
	};
};
