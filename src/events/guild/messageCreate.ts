import { Message } from "discord.js";
import SCESocClient from "src/Client";
import { CommandUnimplementedError } from "../../commands/Command";
import { blockedMessage } from "../../../user_modules/blocked_messages";

module.exports = async (client: SCESocClient, message: Message, late = false) => {
	if (message.partial) 
		message = await message.fetch();

	try { // If message starts with prefix, send to command handler
		let wasCommand = false;
		if (message.content.toLowerCase().startsWith(client.prefix)) 
			wasCommand = await commandHandler(client, message, late);

		if (wasCommand) { // Delete command invocation
			await client.deleteMessage(message, 0);
			return;
		}

		await blockedMessage(message);
	} catch (error) { // bullet proof runtime?
		console.log("Something has gone seriously wrong");
		console.error(error)
	}

}

/**
 * 
 * Executes a command specified by the user if it exists.
 * If the command does not exist, returns false
 * 
 * @param client 
 * @param message 
 * @returns true if the message was a command, false otherwise
 */
const commandHandler = async (client: SCESocClient, message: Message, late = false) => {
	// Parse the command into an easy to use format
	const content = message.content.toLowerCase();
	const args = content.trim().slice(client.prefix.length).split(/ +/);
	const commandName = args.shift();

	// Check if real command
	if (!commandName || !client.commands.has(commandName))
		return false;
	
	const command = client.commands.get(commandName);
	const { member } = message;
	
	if (!command || !member) return false;

	// Test to see if user has perms to use this command
	if (!command.validateUser(member)) {
		const msg = await message.channel.send({content: "Can't let you use this command, bub."})
		await client.deleteMessage(msg);
		return true;
	}
	
	try { // Run command and send the response
		const output = await command.textCommand(message, args);
		if (!output) return true;
		
		if (late)
			output.content = "Sorry for the late response!\n" + (output.content || "");

		const response = await (late ? message.reply(output) : message.channel.send(output));
		const { id } = member;

		// If member has an override set, wait until then to delete message
		// E.g arguments rejected
		if (command.autoclearOverride.has(id)) {
			const autoclear = command.autoclearOverride.get(id)
			command.autoclearOverride.delete(id)
			await client.deleteMessage(response, autoclear);
			
		} else if (command.autoclear > 0) { // Normal autoclear behaviour
			await client.deleteMessage(response, command.autoclear);
		}

	} catch (error) {
		if (error instanceof CommandUnimplementedError) { // get mad at maintainer
			message.channel.send({ content: `<@${client.maintainer}>, you should probably hurry up`
				+ ` and implement this command: \`${error.command}\``
			})
			
		} else { // tell the user something went wrong
			const e_msg = await message.channel.send({
				content: "Something went wrong, please try again!"
					+ "If the problem persists, please contact Brethan#1337"
			});
			
			console.error(error);
			await client.deleteMessage(e_msg, 6_000);
		}

	}
	
	return true;
}
