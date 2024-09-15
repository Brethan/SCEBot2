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

	/**
	 * Sets the server that this command is ran in to the guild_id in the config file.
	 * 
	 * @param message 
	 * @returns 
	 */
	async textCommand(message: Message): Promise<MessageCreateOptions> {
		if (!message.guild)	throw new Error();

		this.client.config.guild_id = message.guild.id;
		this.client.overwriteConfig();

		return { content: "This server has been set as the guild." };
	}
}
