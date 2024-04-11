import { EmbedBuilder, ImageURLOptions, Message, MessageCreateOptions, MessageMentions } from "discord.js";
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
		// Select between the command invoker or the invoker's target
		const { member } = message;
		const mentioned = message.mentions.members?.first();
		const target = (!args.length || args.length > 1) ? member : mentioned;

		// Resort to the generic error message if something went wrong
		if (!target) throw new Error();
		
		// Collection server avatar and display name of the target
		const imageUrl = target.displayAvatarURL({ size: 512, extension: "png", forceStatic: false });
		const name = target.displayName;
		
		// Generate and return the embed to send back to the invoker
		const embed = new EmbedBuilder()
			.setDescription("**Server Avatar**")
			.setColor("Yellow")
			.setImage(imageUrl)
			.setAuthor({ name: name, iconURL: imageUrl });


		return { embeds: [embed] };
	}
}
