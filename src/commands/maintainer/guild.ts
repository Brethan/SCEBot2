import { Message, MessageCreateOptions } from "discord.js";
import SCESocClient from "src/Client";
import Command from "../Command";

export default class Guild extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "guild",
			autoclear: 3_000
		})
	}

	async textCommand(message: Message): Promise<MessageCreateOptions> {
		this.client.config.guild_id = message.guild.id;
		this.client.overwriteConfig();

		return { content: "This server has been set as the guild." };
	}
}