const permissions = {
	ADMINISTRATOR: 'Administrator',
	VIEW_AUDIT_LOG: 'View Audit Log',
	MANAGE_GUILD: 'Manage Server',
	MANAGE_ROLES: 'Manage Roles',
	MANAGE_CHANNELS: 'Manage Channels',
	KICK_MEMBERS: 'Kick Members',
	BAN_MEMBERS: 'Ban Members',
	CREATE_INSTANT_INVITE: 'Create Instant Invite',
	CHANGE_NICKNAME: 'Change Nickname',
	MANAGE_NICKNAMES: 'Manage Nicknames',
	MANAGE_EMOJIS: 'Manage Emojis',
	MANAGE_WEBHOOKS: 'Manage Webhooks',
	VIEW_CHANNEL: 'Read Text Channels And See Voice Channels',
	SEND_MESSAGES: 'Send Messages',
	SEND_TTS_MESSAGES: 'Send TTS Messages',
	MANAGE_MESSAGES: 'Manage Messages',
	EMBED_LINKS: 'Embed Links',
	ATTACH_FILES: 'Attach Files',
	READ_MESSAGE_HISTORY: 'Read Message History',
	MENTION_EVERYONE: 'Mention Everyone',
	USE_EXTERNAL_EMOJIS: 'Use External Emojis',
	ADD_REACTIONS: 'Add Reactions',
	CONNECT: 'Connect',
	SPEAK: 'Speak',
	MUTE_MEMBERS: 'Mute Members',
	DEAFEN_MEMBERS: 'Deafen Members',
	MOVE_MEMBERS: 'Move Members',
	USE_VAD: 'Use Voice Activity',
};

const Vimotes = {
	AUTHORIZED: '<:authorized:753802620614869032>',
	AWAY: '<:away:753802620665331793>',
	BOOST1: '<:boost1:753802620619063397>',
	BOOST2: '<:boost2:753802620287582260>',
	BOOST3: '<:boost3:753802620250095798>',
	BOOST4: '<:boost4:753802620564668596>',
	BUG_FOUND: '<:bug_found:753804781021167747>',
	BUG_RESOLVED: '<:bug_resolved:753804780870303838>',
	BAN_HAMMER: '<:ban_hammer:842969864964800543>',
	CHANNEL: '<:channel:753802620279324724>',
	CHANNEL_LOCKED: '<:channel_locked:753802620589703221>',
	CHANNEL_NSFW: '<:channel_nsfw:753802620195569665>',
	CHECK: '<:check:753802620644360213>',
	DISCORD: '<:discord:753802620342239377>',
	DND: '<:dnd:753802620661137529>',
	EMPTY: '<:empty:753802620619194378>',
	HYPESQUAD: '<:hypesquad:753802620342108161>',
	INVITE: '<:invite:753802620606611467>',
	UP_ARROW: '<:up_arrow:842976624818913311>',
	JOIN_ARROW: '<:join_arrow:753802620401090571>',
	LEAVE_ARROW: '<:leave_arrow:842849095600439317>',
	MEMBERS: '<:members:753802620623126608>',
	MUTED: '<:muted:753802620736503849>',
	NEWS: '<:news:753802620627320832>',
	NITRO: '<:nitro:753802620644229231>',
	OFFLINE: '<:offline:753802620614738020>',
	ONLINE: '<:online:753802620501491713>',
	OWNER: '<:owner:753802620745023498>',
	PIN: '<:pin:753802620522725478>',
	SETTINGS: '<:settings:753802620509880331>',
	SLOWMODE: '<:slowmode:753802620379856957>',
	STAFF: '<:staff:753802620698886234>',
	STAFFTOOLS: '<:stafftools:753802620933505085>',
	STREAMING: '<:streaming:753802620677652520>',
	SUPPORTER: '<:supporter:753802620673589309>',
	TWITCH: '<:twitch:753802620887498822>',
	UNMUTED: '<:unmuted:753802620375662644>',
	UPDATE: '<:update:753802620807807036>',
	VERIFIED: '<:verified:753802621134831686>',
	VOICE: '<:voice:753802620887498812>',
	VOICE_LOCKED: '<:voice_locked:753802620858138715>',
	XMARK: '<:xmark:753802620682109019>',
	A_LOADING: '<a:loading:753802620665200740>',
	A_TYPING: '<a:typing:753802620539502593>',
	A_TYPINGSTATUS: '<a:typingstatus:753802620744761464>',
	A_UPDATING: '<a:updating:753802620694429827>',
};

const canModifyQueue = async (member) => {
	const { channelID } = member.voice;
	const botChannel = member.guild.voice.channelID;
	if (channelID !== botChannel) {
		member.send('You need to join the voice channel first!').catch(console.error);
		return;
	}
	return true;
};

const createBar = (total, current, size = 40, line = '▬', slider = '🔘') => {
	if (!total) throw new Error('Total value is either not provided or invalid');
	if (!current) throw new Error('Current value is either not provided or invalid');
	if (isNaN(total)) throw new Error('Total value is not an integer');
	if (isNaN(current)) throw new Error('Current value is not an integer');
	if (isNaN(size)) throw new Error('Size is not an integer');
	if (current > total) {
		const bar = line.repeat(size + 2);
		const percentage = (current / total) * 100;
		return [bar, percentage];
	}
	else {
		const percentage = current / total;
		const progress = Math.round((size * percentage));
		const emptyProgress = size - progress;
		const progressText = line.repeat(progress).replace(/.$/, slider);
		const emptyProgressText = line.repeat(emptyProgress);
		const bar = progressText + emptyProgressText;
		const calculated = percentage * 100;
		return [bar, calculated];
	}
};

module.exports = {
	permissions,
	Vimotes,
	canModifyQueue,
	createBar,
};