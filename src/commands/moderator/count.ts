import Command, { ElevatedRole } from "../Command";
import { Message, MessageCreateOptions, Role } from "discord.js";
import SCESocClient from "src/Client";

export default class Count extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "count",
			elevatedRole: ElevatedRole.MODERATOR,
			autoclear: -1,
		})
	}

	/**
	 * 
	 * @param message 
	 * @param args 
	 * @returns 
	 * @override
	 */
	async textCommand(message: Message, args: string[]): Promise<MessageCreateOptions> {
		const { aliasToProgram, config } = this.client;
		const rejectResponse = `\nYou can find the list in <#${config.channels.roles}>:\n\`Program Name - "Alias"\``;
		if (!message.member || !message.guild) 
			throw new Error();

		if (!args.length) { // user did not provide args
			return this.rejectArgs({ content: `You didn't supply a program alias!` + rejectResponse },
				message.member.id)
		}

		const alias = args[0];
		if (!aliasToProgram.has(alias)) { // user provided args that don't work
			return this.rejectArgs({ content: `I don't recognize this program alias!` + rejectResponse },
				message.member.id);
		}

		const programName = aliasToProgram.get(alias);
		const programRole = message.guild.roles.cache.find(r => r.name === programName);
		const membersInProgram: number = programRole?.members.size || 0;

		return { content: `I counted ${membersInProgram} server members in ${programName}!` };
	}
}
