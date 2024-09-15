import { Message, MessageCreateOptions, Snowflake, TextChannel } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";

export default class EmbedScrape extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "embedscrape",
			elevatedRole: ElevatedRole.MAINTAINER,
			autoclear: 3_500
		})
	}

	/**
	 * Saves an embed message to the ./data/embeds folder for debugging or 
	 * to paste it using the embedpaste command. The embed is saved using 
	 * the current unix timestamp allowing for the most recent save to be 
	 * retrieved easily.
	 * 
	 * @param message 
	 * @param args 
	 * @returns 
	 */
	async textCommand(message: Message, args: string[]): Promise<MessageCreateOptions> {
		const dir = "./data/embeds/";
		if (!existsSync(dir)) {
			await mkdir(dir, { recursive: true });
		}

		const memberId = message.member?.id;

		if (args.length != 2) {
			return this.rejectArg(memberId);
		}

		// Message Id should be the last argument sent
		const messageId = args.pop();
		const channel = message.mentions.channels.first();

		if (messageId?.match(/\<\#\d{10,}\>/) || !channel || !(channel instanceof TextChannel)) {
			return this.rejectArg(memberId);
		}

		const messages = await channel.messages.fetch();
		const target = messages.filter(m => m.id === messageId).first();

		// If the message doesn't exist or there are no embeds attached
		if (!target || !target.embeds.length) 
			return this.rejectArg(memberId);
		
		// Write the embed data to the file system for later use.
		const json = JSON.stringify(target.embeds.shift()?.toJSON(), null, 4);
		const path = `./data/embeds/${(new Date()).getTime()}.json`

		await writeFile(path, json)

		return { content: `Maintainer, you can view the embed json in ${path}!` };
	}

	rejectArg(id: string | undefined): MessageCreateOptions {
		const fail = "You should probably learn how to use this command: \n\n"
				+ `${this.client.prefix + this.name} #text-channel-name <message-id>`

		return super.rejectArgs({content: fail}, id || "", 18_000);
	}
}
