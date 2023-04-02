import { Message, MessageCreateOptions } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";

export default class Guild extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "gitpull",
			elevatedRole: ElevatedRole.MAINTAINER,
			autoclear: 3_000
		})
	}

	async textCommand(message: Message): Promise<MessageCreateOptions> {
		message.react("💀");
		new Promise(resolve => { throw new Error() });


		return { content: "I'm dead 💀" };
	}
}
