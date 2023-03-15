import { TextChannel } from "discord.js";
import SCESocClient from "src/Client";

module.exports = async (client: SCESocClient) => {
	if (!client || !client.user) return;
	
	// Routine to update all members with the member role while the bot was offline
	console.time("Member update routine");
	try {
		const id = client.config.guild_id
		const guild = await client.guilds.fetch(id);
		await guild.roles.fetch();
		console.log("All roles fetched.");

		// fetch the member role
		const memberRoleId = client.config.elevated_roles.member;
		const memberRole = await guild.roles.fetch(memberRoleId);
		
		if (!memberRole) // give up, start the bot.
			throw new Error();

		console.log("Member role fetched.");

		// Fetch all members without the member role
		const membersWORole = (await guild.members.fetch()).filter(mem => !mem.roles.cache.has(memberRoleId));
		if (membersWORole.size == 0)
			throw new Error("Bypass member update routine");
			
		const channel = <TextChannel> await guild.channels.fetch(client.config.channels.log);
		console.log("Logging channel fetched");
		
		const update = await channel.send({ content: `Updating ${membersWORole.size} members without the member role.` });

		// Assign the member role to everyone without
		for (const nrm of membersWORole.values()) {
			await nrm.roles.add(memberRole);
			await client.sleep(1_000);
		}
		
		await update.edit({ content: update.content.replace("ing", "ed") })
		
	} catch (error) {
		console.log("Member routine exited with an error.");
	}
	
	console.timeEnd("Member update routine");
	console.log(`${client.user.tag} is ready!`);
}
