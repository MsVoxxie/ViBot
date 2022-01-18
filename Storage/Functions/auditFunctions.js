//Kick Check
KickCheck = async function (member) {
	return new Promise(async function (resolve, reject) {
		try {
			let guild = member.guild;

			if (!guild.me.permissions.has('VIEW_AUDIT_LOG')) return resolve(false);

			const AuditLogFetch = await guild.fetchAuditLogs({
				limit: 1,
				type: 'MEMBER_KICK',
			});

			if (!AuditLogFetch || AuditLogFetch.entries.size === 0) return resolve(false);

			const FirstEntry = AuditLogFetch.entries.first();

			if (FirstEntry.createdTimestamp > Date.now() - 6000 === false) return resolve(false);
			const { executor, target } = FirstEntry;

			const Info = {
				user: target.username,
				id: target.id,
				kickedby: executor.username,
				reason: FirstEntry.reason,
			};

			return resolve(Info);
		} catch (e) {
			reject(e);
		}
	});
};

// RoleCreateCheck
RoleCreateCheck = async function (role) {
	return new Promise(async function (resolve, reject) {
		try {
			let guild = role.guild;

			if (!guild.me.permissions.has('VIEW_AUDIT_LOG')) return resolve(false);

			const AuditLogFetch = await guild.fetchAuditLogs({
				limit: 1,
				type: 'ROLE_CREATE',
			});

			if (!AuditLogFetch || AuditLogFetch.entries.size === 0) return resolve(false);

			const FirstEntry = AuditLogFetch.entries.first();

			if (FirstEntry.createdTimestamp > Date.now() - 6000 === false) return resolve(false);
			const { executor, target } = FirstEntry;

			const Info = {
				role: target.username,
				roleid: target.id,
				createdby: executor.username,
				reason: FirstEntry.reason,
			};

			return resolve(Info);
		} catch (e) {
			reject(e);
		}
	});
};

//RoleUpdateCheck
RoleUpdateCheck = async function (role) {
	return new Promise(async function (resolve, reject) {
		try {
			let guild = role.guild;

			if (!guild.me.permissions.has('VIEW_AUDIT_LOG')) return resolve(false);

			const AuditLogFetch = await guild.fetchAuditLogs({
				limit: 1,
				type: 'ROLE_UPDATE',
			});

			if (!AuditLogFetch || AuditLogFetch.entries.size === 0) return resolve(false);

			const FirstEntry = AuditLogFetch.entries.first();

			if (FirstEntry.createdTimestamp > Date.now() - 6000 === false) return resolve(false);
			const { executor, target } = FirstEntry;

			const Info = {
				role: target.username,
				roleid: target.id,
				createdby: executor.username,
				reason: FirstEntry.reason,
			};

			return resolve(Info);
		} catch (e) {
			reject(e);
		}
	});
};

//RoleDeleteCheck
RoleDeleteCheck = async function (role) {
	return new Promise(async function (resolve, reject) {
		try {
			let guild = role.guild;

			if (!guild.me.permissions.has('VIEW_AUDIT_LOG')) return resolve(false);

			const AuditLogFetch = await guild.fetchAuditLogs({
				limit: 1,
				type: 'ROLE_DELETE',
			});

			if (!AuditLogFetch || AuditLogFetch.entries.size === 0) return resolve(false);

			const FirstEntry = AuditLogFetch.entries.first();

			if (FirstEntry.createdTimestamp > Date.now() - 6000 === false) return resolve(false);
			const { executor, target } = FirstEntry;

			const Info = {
				role: target.username,
				roleid: target.id,
				createdby: executor.username,
				reason: FirstEntry.reason,
			};

			return resolve(Info);
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	KickCheck,
	RoleCreateCheck,
	RoleUpdateCheck,
	RoleDeleteCheck,
};
