import { Message, MessageCreateOptions } from "discord.js";
import SCESocClient from "src/Client";
import Command from "../Command";

export default class Channel extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "channel",
			autoclear: 3_000
		})
	}

	async textCommand(message: Message, args: string[]): Promise<MessageCreateOptions> {
		const channels: string[] = [];
		for (const c in this.client.config.channels) {
			channels.push(c);
		} 

		const pattern = RegExp(channels.join("|"), "gi");
		const matches = message.content.match(pattern);
		if (!matches) {
			await message.react('👎');
			return { content: "Not sure what " + args.join(" or ") + " is supposed to mean..." }
		}

		const selChannel = matches[0];
		this.client.config.channels[selChannel] = message.channel.id;
		this.client.overwriteConfig();

		return { content: "This channel has been set as the " + selChannel + " channel" };
	}
}