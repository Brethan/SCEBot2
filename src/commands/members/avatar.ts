import { EmbedBuilder, Message, MessageCreateOptions, MessageMentions } from "discord.js";
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
		const { member, guild } = message;

		if (!member || !guild) throw new Error();

		let imageUrl: string = "";
		let name: string = "";

		if (!args.length || args.length > 1) {
			imageUrl = member.displayAvatarURL();
			name = member.user.username;
		} else if (args.length == 1) {
			const target = message.mentions.members?.first();
			if (!target) 
				return { content: "Let's mention someone shall we?" };

			imageUrl = target.displayAvatarURL({ size: 512 });
			name = target.user.username;
		}
		
		const embed = new EmbedBuilder()
			.setDescription("**Server Avatar**")
			.setColor("Yellow")
			.setImage(imageUrl)
			.setAuthor({ name, iconURL: imageUrl });


		return { embeds: [embed] };


	}
}
