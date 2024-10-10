import { BaseGuildTextChannel, Message, MessageCreateOptions } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";

export default class Channel extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "channel",
			elevatedRole: ElevatedRole.MAINTAINER,
			autoclear: 3_000
		})
	}

	/**
	 * Sets the channel the command was invoked within to the specified utility
	 * channel requested by the maintainer.
	 * 
	 * @param message 
	 * @param args Expecting one of ["log", "roles", "lobby", "interact", "reception", "announcement"]
	 * @returns 
	 */
	async textCommand(message: Message, args: string[]): Promise<MessageCreateOptions> {
		const channels: string[] = [];
		// Collect all the channels as strings
		for (const c in this.client.config.channels) {
			channels.push(c);
		} 

		// Use the channels to create a pattern to match the input against
		const pattern = RegExp(channels.join("|"), "gi");
		const matches = message.content.match(pattern);

		if (!matches) { // No matches, tell the user
			await message.react('👎');
			return { content: "Not sure what " + args.join(" or ") + " is supposed to mean..." }
		}

		// Found match(es), set the first match in the 
		// list to the channel id command was invoked in
		const selChannel = matches[0];
		const oldChannel = this.client.config.channels[selChannel];

		if (oldChannel === message.channel.id) 
			return { content: "This channel has already been set as the " + selChannel + " channel" };

		this.client.config.channels[selChannel] = message.channel.id;
		this.client.specialChannels.set(message.channel.id, <BaseGuildTextChannel>message.channel);
		this.client.overwriteConfig();

		if (oldChannel)
			this.client.specialChannels.delete(oldChannel);

		return { content: "This channel has been set as the " + selChannel + " channel" };
	}
}
