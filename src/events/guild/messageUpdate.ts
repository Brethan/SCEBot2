import { EmbedBuilder, Message, TextChannel } from "discord.js";
import SCESocClient from "src/Client";

module.exports = async (client: SCESocClient, oldMessage: Message, newMessage: Message) => {
	try {
		if (!oldMessage || !oldMessage.content || !oldMessage.author || oldMessage.author.bot)
			return;

		const embed = new EmbedBuilder()
			.setAuthor({ name: oldMessage.author.username, iconURL: oldMessage.author.displayAvatarURL() })
			.setDescription(`**Message Edited by ${oldMessage.author} in ${oldMessage.channel}**\n`
				+ `**Before**\n`
				+ `Contents: ${oldMessage.content}\n`
				+ `Attachments: ${oldMessage.attachments.size}\n\n`
				+ `**After**\n`
				+ `Contents: ${newMessage.content}\n`
				+ `Attachments: ${newMessage.attachments.size}\n`
			)
			.setFooter({
				text: `Author: ${oldMessage.author.id} | Message ID: ${oldMessage.id} |`
			}).setColor("Yellow")
			.setTimestamp();

		await client.serverLog({ embeds: [embed] }, <TextChannel>oldMessage.channel);
	} catch (error) {
		if (error instanceof Error)
			client.logError(error.stack || error.message);
	}

}