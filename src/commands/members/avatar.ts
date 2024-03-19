import { EmbedBuilder, Message, MessageCreateOptions } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";

export default class Avatar extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "avatar",
			elevatedRole: ElevatedRole.MEMBER,
		})
	}

	async textCommand(message: Message, args: string[]): Promise<MessageCreateOptions> {
		const { member } = message;

		if (!member) throw new Error();
		
		let imageUrl: string = "";
		if (!args.length) {
			imageUrl = member.displayAvatarURL();
		}
		
		const embed = new EmbedBuilder()
			.setThumbnail(imageUrl);

		return { embeds: [embed] };


	}
}
