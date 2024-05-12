import { Invite, Message, TextChannel } from "discord.js";
import SCESocClient from "src/Client";
import { CommandUnimplementedError } from "../../commands/Command";
import { blockedMessage } from "../../../user_modules/blocked_messages";

module.exports = async (client: SCESocClient, message: Message) => {
	if (message.partial) 
		message = await message.fetch();

	if (await hasUnauthorizedDiscordLink(client, message)) {
		return;
	}
	try { // If message starts with prefix, send to command handler
		let wasCommand = false;
		if (message.content.toLowerCase().startsWith(client.prefix)) 
			wasCommand = await commandHandler(client, message);

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

async function hasUnauthorizedDiscordLink(client: SCESocClient, message: Message): Promise<boolean> {
	const { member } = message;
	const channel = <TextChannel> message.channel; 
	const inviteMatch = message.content.match(Invite.InvitesPattern);
	
	// Return if there is something wrong with the data 
	if (!member || !member.joinedTimestamp) {
		return false;
	}

	// If there are no invite matches, return
	if (!inviteMatch?.input) {
		return false;
	}

	const invite = await client.fetchInvite(inviteMatch.input)
	const inviteInfo = `@${member.displayName} in #${channel.name}    [Invite to ${invite.guild?.name}: ${invite.url}]`;
	
	if (client.isMemberModerator(member)) {
		client.logNotice(`Discord Link Detected - Sent by server staff ${inviteInfo}`);
		return false;
	}
	
	if (invite.guild === message.guild) {
		client.logNotice(`Discord Link Detected - Invite to this server ${inviteInfo}`);
		return false;
	}

	// Immediately timeout members who have been in the server for less than 3 days 
	const CUTOFF = 7; // TODO: Make this configurable through the bot
	const MINUTES = 90; // TODO: Make this configurable through the bot, client abstraction required
	const timeSinceJoined = message.createdTimestamp - member.joinedTimestamp;
	
	// 1000(ms / s) * 60(s / min) * 60(min / hr) * 24(hr / day)
	const msPerDay = 1000 * 60 * 60 * 24; 

	const timeoutMember = Math.floor(timeSinceJoined / msPerDay) <= CUTOFF;
	const timeoutMessage = `\n\nYou have been timed out for ${MINUTES} minutes.`;

	const content = "Please do not share Discord invite links on the SCESoc server!"
		+ "\nIf you would still like to share this link, please ask the VP Publications,"
		+ " a moderator, or any other staff."
		+ "\nWe apologize for any inconvenience this causes!"
		+ (timeoutMember ? timeoutMessage : "");

	/**
	 * TODO: make a command for this
	 * 
	 * Members timed out for this reason should be added to a collection.
	 * 
	 * The timed out members should be able to displayed and / or removed 
	 * through a command:
	 * 
	 * - 	timeout should be a client member
	 * - 	Timing out an advertiser should flag their account and the 
	 * 		cutoff time will not be considered if they advertise again
	 * -	Removing an advertiser from the list will cancel the timeout
	 * 		(if still active) and from the list of advertisers
	 * -	prefix.advertisers should display a list of all advertisers
	 * 		and whether or not the timeout is still active
	 * -	prefix.advertisers remove should be an interactive way for
	 * 		a moderator+ to remove the flag from the member
	 * 
	 * client.timeoutMember(message)
	 */

	// Timeout the member for MINUTES... minutes
	const TIMEOUT_TIME = MINUTES * 60 * 1000;
	await member.timeout(TIMEOUT_TIME, "User sent a discord server invite link within 3 days of joining the server.");
	const reply = await message.reply({ content: content });
	await client.deleteMessage(message, 0);

	client.deleteMessage(reply, 10_000).catch(console.error);
	client.logNotice(`Discord Link Detected - Sent by a server member ${inviteInfo}`);

	
	return true;
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
