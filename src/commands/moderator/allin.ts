import { Message, MessageCreateOptions } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";

export default class AllIn extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "allin",
			description: "Checks however many people are in a voice channel",
			elevatedRole: ElevatedRole.MODERATOR,
			autoclear: -1,
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
