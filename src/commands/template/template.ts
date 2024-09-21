import { Message, MessageCreateOptions } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";

export default class Template extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "template",
			description: "an easy command to copy and paste",
			elevatedRole: ElevatedRole.MAINTAINER,
			autoclear: 3_000
		})
	}

	/**
	 * 
	 * @param message A discord message
	 * @param args Write the arguments you expect here
	 * @returns 
	 */
	async textCommand(message: Message, args: string[]): Promise<MessageCreateOptions | null> {
		return (super.textCommand(message, args)); // This throws a command not implemented exception
	}
}
