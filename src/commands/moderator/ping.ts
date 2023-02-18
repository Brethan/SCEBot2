import { Message, MessageCreateOptions, TextChannel } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";

export default class Ping extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "evict",
			elevatedRole: ElevatedRole.MODERATOR,
			autoclear: 3_000
		})
	}

	async textCommand(message: Message, args: string[]): Promise<MessageCreateOptions> {
		if (!(message.channel instanceof TextChannel)) return;
		const { id } = message.member
		if (!args.length)
			return this.rejectArgs({ content: "Please specify how many messages you want deleted." }, id);
		
		const amount = parseInt(args[0]);
		if (amount < 1 || amount > 100) {
			return this.rejectArgs({ content: "Please specify a number between [1, 100)."}, id);
		}

		await message.channel.bulkDelete(amount, true);

		return { content: `Deleted ${amount} messages!` };
	}
}
