import { Message } from "discord.js";
import SCESocClient from "src/Client";

module.exports = async (client: SCESocClient, message: Message) => {
	if (message.partial) 
		message = await message.fetch();

	try { // If message starts with prefix, send to command handler
		if (message.content.toLowerCase().startsWith(client.prefix)) 
			commandHandler(client, message);

		return;
	} catch (error) { // bullet proof runtime?
		console.log("Something has gone seriously wrong");
	}


}

const commandHandler = async (client: SCESocClient, message: Message) => {
	// Parse the command into an easy to use format
	const content = message.content.toLowerCase();
	const args = content.trim().slice(client.prefix.length).split(/ +/);
	const commandName = args.shift();

	// Check if real command
	if (!client.commands.has(commandName))
		return;
	
	const command = client.commands.get(commandName);
	const { member } = message;

	// Test to see if user has perms to use this command
	if (!command.validateUser(member))
		return message.channel.send({content: "Can't let you use this command, bub."})
			.then((msg: Message) => client.deleteMessage(msg));
	
	try { // Run command and send the response
		const output = await command.textCommand(message, args);
		const response = await message.channel.send(output);
		if (command.autoclear > 0) { // If command has autoclear... do that :)
			await client.deleteMessage(response, command.autoclear);
		}

	} catch (error) { // If command throws error, tell user and log error
		const e_msg = await message.channel.send({content: "Something went wrong, please try again!"});
		await client.deleteMessage(e_msg, 6_000);
		console.error(error);
	}
	
	// Delete command invocation message
	await message.delete();

}
