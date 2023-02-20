import { GuildMember } from "discord.js";
import SCESocClient from "src/Client";

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
