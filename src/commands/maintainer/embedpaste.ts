import { APIEmbed, Message, MessageCreateOptions, TextChannel } from "discord.js";
import { mkdir, readFile, readdir } from "fs/promises";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";
import { existsSync } from "fs";

export default class EmbedPaste extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "embedpaste",
			elevatedRole: ElevatedRole.MAINTAINER,
		})
	}

	/**
	 * Pastes saved embed messages from the server into another channel.
	 *
	 * The embedscrape function saves each message using a unix timestamp
	 * meaning that file the highest value is the most recent message.
	 * 
	 * @see ./src/commands/maintainer/embedscrape.ts
	 * @param message 
	 * @returns 
	 */
	async textCommand(message: Message, args: string[]): Promise<MessageCreateOptions> {
		// Filter through all of the copied embeds
		const dir = "./data/embeds/";
		if (!existsSync(dir)) {
			await mkdir(dir, { recursive: true });
		}
		
		const dirContent = (await readdir(dir))
			.filter(file => file.endsWith(".json"))
			.filter(file => !isNaN(parseInt(file.split(".")[0])))
			.sort((a, b) => parseInt(a.split(".")[0]) - parseInt(b.split(".")[0]))
		
		if (!dirContent.length) {
			return { content: "You do not currently have any saved embeds." };
		}
		
		// Should be the most recent of the copied embeds
		const filename = dir + dirContent.pop();
		
		const raw = await readFile(filename, { encoding: "utf8" });
		const json: APIEmbed = JSON.parse(raw) satisfies APIEmbed;

		if (args.includes("-t"))
			json.thumbnail = { url: message.guild?.iconURL() || "" };
		if (args.includes("-a"))
			json.author = { name: "SCESoc", icon_url: message.guild?.iconURL() || "" };
		if (args.includes("-f")) {
			const start = message.content.indexOf("\"", message.content.indexOf("-f")) + 1;
			const end = message.content.indexOf("\"", start);
			if (end > start)
				json.footer = { text: message.content.substring(start, end) }
		}

		// if there's a channel mentioned in the message, send the embed to that channel
		const channel = message.mentions.channels.first() as (TextChannel | undefined);
		if (channel) {
			channel.send({ embeds: [json] });
			return { content: "Pasting most recently scraped embed in " + channel.toString() }
		} else { // otherwise send it to the channel of invocation 
			return { content: `Pasting most recently scraped embed: `, embeds: [json] };
		}

	}
}
