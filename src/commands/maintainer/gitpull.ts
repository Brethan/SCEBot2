import { ActivityType, Message, MessageCreateOptions } from "discord.js";
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

	/**
	 * Crashes the bot. That's all.
	 * 
	 * @param message 
	 * @returns 
	 */
	async textCommand(message: Message): Promise<MessageCreateOptions> {
		this.client.gitpull = message.channel.id;
		await message.react("💀");
		this.client.user?.setPresence({ activities: [{ name: "brainwashing", type: ActivityType.Listening }] })
		new Promise(_ => { throw new Error() });


		return { content: "I'm dead 💀" };
	}
}
