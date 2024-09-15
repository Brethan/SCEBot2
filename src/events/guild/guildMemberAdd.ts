import { GuildMember } from "discord.js";
import SCESocClient from "src/Client";

/**
 * the guildMemberAdd event is emitted every time that a new member joins the
 * Discord server.
 * 
 * The member role will be added to each member that joins.
 */
module.exports = async (client: SCESocClient, member: GuildMember) => {
	try {
		if (member.partial)
			member = await member.fetch();

		const memberRoleId = client.config.elevated_roles.member;
		const role = await member.guild.roles.fetch(memberRoleId);

		if (role)
			member.roles.add(role);

	} catch (error) {
		console.log("Couldn't add role to new member:",  member?.user?.tag);
	}
}
