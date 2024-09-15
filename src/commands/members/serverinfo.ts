import { CategoryChannel, EmbedBuilder, Message, MessageCreateOptions, TextChannel, VoiceChannel } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";

export default class ServerInfo extends Command {
	constructor(client: SCESocClient) {
		super(client, {
			name: "serverinfo",
			elevatedRole: ElevatedRole.MEMBER,
		})
	}

	/**
	 * Compiles various information about the server and formats it
	 * into an embed message for the guild member invoking the command.
	 * 
	 * @param message 
	 * @returns 
	 */
	async textCommand(message: Message): Promise<MessageCreateOptions> {
		const { guild } = message;
		if (!guild)
			throw new Error();
		
		const roleCount = (await guild.roles.fetch()).size;
		const memberCount = guild.memberCount;
		const serverOwner = await guild.fetchOwner();

		const channels = await guild.channels.fetch();
		const categoryCount = channels.filter(c => c instanceof CategoryChannel).size;
		const textChannelCount = channels.filter(c => c instanceof TextChannel).size;
		const voiceChannelCount = channels.filter(c => c instanceof VoiceChannel).size;
		
		const creationDate = guild.createdAt;
		const serverId = guild.id;

		const embed = new EmbedBuilder()
			.addFields(
				{ name: "Owner", value: serverOwner.user.username, inline: true },
				{ name: "Members", value: `${memberCount}`, inline: true },
				{ name: "Roles", value: `${roleCount}`, inline: true },
				{ name: "Category Channels", value: `${categoryCount}`, inline: true },
				{ name: "Text Channels", value: `${textChannelCount}`, inline: true },
				{ name: "Voice Channels", value: `${voiceChannelCount}`, inline: true },
				{ name: "Server ID", value: `${ serverId }`, inline: true },
			).setAuthor({ name: guild.name, iconURL: guild.iconURL({ extension: "png" }) || "" })
			.setFooter({ text: `SCESoc server created on: ${creationDate.toLocaleString()}` })
			.setColor("Yellow");
		
		return { embeds: [ embed ] };

	}
}
