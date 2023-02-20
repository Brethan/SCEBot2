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

	async textCommand(message: Message, args: string[]): Promise<MessageCreateOptions | null> {
		if (!(message.channel instanceof TextChannel) || !message.member) 
			return null;
			
		const { id } = message.member

		if (!args.length) // user didn't provide any arguments
			return this.rejectArgs({ content: "Please specify how many messages you want deleted." }, id);
		
		const amount = parseInt(args[0]);
		if (isNaN(amount) || (amount < 1 || amount > 100)) { // user provided invalid arguments
			return this.rejectArgs({ content: "Please specify a number between [1, 100)."}, id);
		}

		await message.channel.bulkDelete(amount, true);

		return { content: `Deleted ${amount} messages!` };
	}
}
