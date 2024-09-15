import { Message, MessageCreateOptions } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";

export default class Assign extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "assign",
			elevatedRole: ElevatedRole.MEMBER,
			autoclear: 5_000
		})
	}

	/**
	 * Assigns a role from a pre-established list of roles which guild members can 
	 * invoke this command with.
	 * @param message 
	 * @param args 
	 * @returns 
	 */
	async textCommand(message: Message, args: string[]): Promise<MessageCreateOptions> {
		const { aliasToProgram } = this.client;
		const { roles } = this.client.config.channels;
		const { member } = message;

		if (!member) throw new Error();
		
		// No args provided or user gave bad args
		if (!args.length || !aliasToProgram.has(args[0])) {
			return this.rejectArgs({ content: `You need to select a role from the list in <#${roles}>!` }, member.id);
		} 

		// Find role and give to user
		const roleName = aliasToProgram.get(args[0]);
		const role = message.guild?.roles.cache.find(r => r.name === roleName);

		if (!role) throw new Error();

		await member.roles.add(role);
		await message.react("👍");

		return { content: "You have been assigned the " + roleName + " role" };
	}
}
