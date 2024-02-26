import { Guild, TextChannel } from "discord.js";
import SCESocClient from "src/Client";

module.exports = async (client: SCESocClient) => {
	if (!client || !client.user) return;

	const handleGitpullRestart = async (guild: Guild) => {
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
	}

	// Routine to update all members with the member role while the bot was offline
	console.time("Member update routine");
	try {
		const id = client.config.guild_id
		const guild = await client.guilds.fetch(id);
		await guild.roles.fetch();
		console.log("All roles fetched.");

		if (client.gitpull.length) {
			try {
				await handleGitpullRestart(guild);
			} catch (error) {
				if (error instanceof Error)
					console.log("Could not delete gitpull messages.\n" + error);

			}
		}

		// fetch the member role
		const memberRoleId = client.config.elevated_roles.member;
		const memberRole = await guild.roles.fetch(memberRoleId);

		if (!memberRole) // give up, start the bot.
			throw new Error();

		console.log("Member role fetched.");

		// Fetch all members without the member role
		const membersWORole = (await guild.members.fetch()).filter(mem => !mem.roles.cache.has(memberRoleId));
		if (membersWORole.size) {
			const channel = <TextChannel>await guild.channels.fetch(client.config.channels.log);
			console.log("Logging channel fetched");

			const update = await channel.send({ content: `Updating ${membersWORole.size} members without the member role.` });

			// Assign the member role to everyone without
			for (const nrm of membersWORole.values()) {
				await nrm.roles.add(memberRole);
				await client.sleep(1_000);
			}

			await update.edit({ content: update.content.replace("ing", "ed") })
		}

		const rolesChannel = <TextChannel>await guild.channels.fetch(client.config.channels.roles);
		const prefix = client.config.prefix;

		const requestMessages = (await rolesChannel.messages.fetch())
			.filter(msg => msg.content.startsWith(prefix))
			.filter(msg => msg.content.slice(prefix.length).match(/assign|remove/gi));

		
		const commandHandler = require("../guild/messageCreate.ts");
		requestMessages.forEach(async msg => await commandHandler(client, msg, true));

	} catch (error) {
		if (error instanceof Error)
			console.log("Member routine exited with an error: " + error.message);
	}

	console.timeEnd("Member update routine");
	console.log(`${client.user.tag} is ready!`);
}

function handleIgnoredRequests(client: SCESocClient) {

}