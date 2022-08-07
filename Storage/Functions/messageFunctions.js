module.exports = (bot) => {
	//Check for Media
	bot.hasMedia = async (message) => {
		let images = [];
		let videos = [];
		let tweetData;
		const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|webp)/;
		const videoRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:mp4|gif|webm|mov)/;
		if (message.content.startsWith('https://twitter.com/')) {
			tweetData = await bot.getTweet(message.content);
		} else {
			if (videoRegex.test(message.content)) {
				videos.push(message.content);
			} else {
				if (imageRegex.test(message.content)) {
					images.push(message.content);
				}
				if (message.attachments.size > 0 && images.length === 0) {
					images = message.attachments.map((a) => a.url).slice(0, 4).map((e) => e);
				}
				if (message.embeds.length > 0 && images.length === 0) {
					images = message.embeds.map((e) => e.image.url).slice(0, 4).map((e) => e);
				}
			}
		}
		console.log({ images, videos, tweetData });
		return { images: images, videos: videos, tweetData: tweetData };
	};
};
