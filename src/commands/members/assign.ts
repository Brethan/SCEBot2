import { Message, MessageCreateOptions } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";

export default class Assign extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "assign",
			elevatedRole: ElevatedRole.NONE,
			autoclear: 5_000
		})
	}

	async textCommand(message: Message, args: string[]): Promise<MessageCreateOptions> {
		const { aliasToProgram } = this.client;
		const { roles } = this.client.config.channels;
		const { member } = message;
		
		// No args provided or user gave bad args
		if (!args.length || !aliasToProgram.has(args[0])) {
			return this.rejectArgs({ content: `You need to select a role from the list in <#${roles}>!` }, member.id);
		} 

		// Find role and give to user
		const roleName = aliasToProgram.get(args[0]);
		const role = message.guild.roles.cache.find(r => r.name === roleName);
		await member.roles.add(role);

		return {content: "You have been assigned the " + roleName + " role"};
	}
}
