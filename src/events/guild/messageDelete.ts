import { EmbedBuilder, Message } from "discord.js";
import SCESocClient from "src/Client";

module.exports = async (client: SCESocClient, message: Message) => {
	try {
		if (!message || !message.content || !message.author)
			return;
		
		// Don't log if it's a text command invocation  
		if (message.content.startsWith(client.prefix))
			return;

		const embed = new EmbedBuilder()
			.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
			.setDescription(`**Message sent by ${message.author} deleted in ${message.channel}**\n`
				+ `Content: ${message.content}\n`
				+ `Attachments: ${message.attachments.size}`)
			.setFooter({
				text: `Author: ${message.author.id} | Message ID: ${message.id} |`
			}).setColor("Yellow")
			.setTimestamp();

		await client.logChannel.send({ embeds: [embed] });
	} catch (error) {
		if (error instanceof Error)
			client.logError(error.stack || error.message);
	}

}