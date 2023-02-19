import { Message, MessageCreateOptions } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";

export default class Guild extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "guild",
			elevatedRole: ElevatedRole.MAINTAINER,
			autoclear: 3_000
		})
	}

	async textCommand(message: Message): Promise<MessageCreateOptions> {
		this.client.config.guild_id = message.guild.id;
		this.client.overwriteConfig();

		return { content: "This server has been set as the guild." };
	}
}
