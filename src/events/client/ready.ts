import { ActivityType, BaseGuildTextChannel, Guild, GuildBasedChannel, TextChannel } from "discord.js";
import SCESocClient from "src/Client";

const handleGitpullRestart = async (client: SCESocClient, guild: Guild) => {
	const pullChannel = <TextChannel | null>await guild.channels.fetch(client.gitpull);
	if (!pullChannel) return;

	const messages = await pullChannel.messages.fetch({ limit: 50 });
	const gitpullMsgs = messages.filter(message => {
		const isMaintainer = message.author.id === client.maintainer;
		const isPullMessage = message.content.toLowerCase() === client.prefix + "gitpull";
		return isMaintainer && isPullMessage;
	});

	for (const msg of gitpullMsgs.values()) {
		await msg.delete();
	}

	client.gitpull = "";
};

const fetchChannels = async (client: SCESocClient, guild: Guild) => {
	const { channels } = client.config;

	for (const [name, id] of Object.entries<string>(channels)) {
		if (!id.length) {
			client.logNotice("Could not find a channel id for " + name.toUpperCase());
			continue;
		}

		const channel = (await guild.channels.fetch(id));
		
		if (!channel || !(channel instanceof BaseGuildTextChannel)) {
			client.logWarning(name.toUpperCase() + " channel did not exist in the server");
			continue;
		}

		client.specialChannels.set(id, channel);
	}
};

module.exports = async (client: SCESocClient) => {
	if (!client || !client.user) return;

	// Routine to update all members with the member role while the bot was offline
	const timer = Date.now();

	try {
		const id = client.config.guild_id
		const guild = await client.guilds.fetch(id);
		await guild.roles.fetch();
		await fetchChannels(client, guild);
		client.logNotice("All roles fetched.");

		if (client.gitpull.length) {
			try {
				await handleGitpullRestart(client, guild);
			} catch (error) {
				if (error instanceof Error)
					client.logError("Could not delete gitpull messages.\n" + error);

			}
		}

		// fetch the member role
		const memberRoleId = client.config.elevated_roles.member;
		const memberRole = await guild.roles.fetch(memberRoleId);

		if (!memberRole) // give up, start the bot.
			throw new Error();

		client.logNotice("Member role fetched.");

		// Fetch all members without the member role
		const membersWORole = (await guild.members.fetch()).filter(mem => !mem.roles.cache.has(memberRoleId));
		if (membersWORole.size) {
			const channel = client.logChannel;
			client.logNotice("Logging channel fetched");

			const update = await channel.send({ content: `Updating ${membersWORole.size} members without the member role.` });

			// Assign the member role to everyone without
			for (const nrm of membersWORole.values()) {
				await nrm.roles.add(memberRole);
				await client.sleep(1_000);
			}

			await update.edit({ content: update.content.replace("ing", "ed") })
		}

		const rolesChannel = client.rolesChannel;
		const prefix = client.prefix;

		const requestMessages = (await rolesChannel.messages.fetch())
			.filter(msg => msg.content.startsWith(prefix))
			.filter(msg => msg.content.slice(prefix.length).match(/assign|remove/gi));


		const commandHandler = require("../guild/messageCreate.ts");
		requestMessages.forEach(async msg => await commandHandler(client, msg, true));

	} catch (error) {
		if (error instanceof Error)
			client.logError("Member routine exited with an error: " + error.message);
	}

	client.logInfo(`Member update routine: ${Date.now() - timer}ms`);
	client.logNotice(`${client.user.tag} is ready!`);
	client.user.setPresence({ activities: [{ name: "your commands requests...", type: ActivityType.Listening }] })
}
