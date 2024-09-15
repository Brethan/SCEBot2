import { MessageCreateOptions } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";

export default class Ping extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "ping",
			elevatedRole: ElevatedRole.MEMBER,
			autoclear: 3_000
		})
	}

	/**
	 * A command as old as time. Responds with "pong"
	 * @returns 
	 */
	async textCommand(): Promise<MessageCreateOptions> {
		return { content: "pong!" };
	}
}
