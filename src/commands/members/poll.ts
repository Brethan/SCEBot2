import { AwaitMessagesOptions, Colors, EmbedBuilder, EmojiIdentifierResolvable, Message, MessageCreateOptions, TextChannel } from "discord.js";
import SCESocClient from "src/Client";
import Command, { ElevatedRole } from "../Command";

export default class Poll extends Command {
	emojis: string[];
	constructor(client: SCESocClient) {
		super(client, {
			name: "poll",
			elevatedRole: ElevatedRole.MEMBER,
			autoclear: 5_000
		})

		this.emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"] satisfies EmojiIdentifierResolvable[];
	}

	/**
	 * A user can create a poll using one of two modes: Immediate and Response
	 * 
	 * Immediate mode applies when a user fills out all the necessary information
	 * for a poll in the original command invocation, the poll can be created immediately
	 * 
	 * Response mode applies when a user invokes the command without any arguments
	 * SCEBot will prompt the user for the poll information
	 *  
	 * @param message 
	 * @param args 
	 * @returns 
	 * @override
	 */
	async textCommand(message: Message, args: string[]): Promise<MessageCreateOptions | null> {
		const response: MessageCreateOptions | null = await (!args.length ? 
			this.responsePoll(message) : this.immediatePoll(message, args));
		
		console.log("bye :)");
		return response;
	}

	async poll(message: Message, title: string, prompt: Message, pollOptions: string[], duration: number) {
		const terminateEmoji = "🚫" satisfies EmojiIdentifierResolvable;
		// Build poll embed
		let description = "To vote, react using the emojis below.";
		description += "\nThe poll has been set to end after " + duration + " seconds."
		description += "\nThe creator of the poll can manually end the poll using the "
		description += terminateEmoji + " emoji\n";

		for (let i = 0; i < pollOptions.length; i++) {
			description += `\n${this.emojis[i]}: ${pollOptions[i]}\n`
		}

		const embed = new EmbedBuilder()
			.setTitle("Poll - " + title)
			.setDescription(description)
			.setColor(Colors.Blurple)
			.setThumbnail(message.guild?.iconURL() 
				|| "https://www.scesoc.ca/wp-content/uploads/2020/05/cropped-SCESoc_Logo_Design_Yellow_2.png"
			).setFooter({
				text: `Created by ${message.author.tag}`,
				iconURL: message.author.displayAvatarURL()
			});

		// send embed, init reactions
		await prompt.edit({ content: "", embeds: [embed] })
		for (let i = 0; i < pollOptions.length; i++) {
			await prompt.react(this.emojis[i]);
		}
	
		// Reaction for terminating poll
		await prompt.react(terminateEmoji); 

		const reactions = prompt.createReactionCollector({
			filter: (reaction, user) => {
				const { name } = reaction.emoji;
				return !!name && !user.bot 
					&& (this.emojis.includes(name) || name === terminateEmoji);
			}, time: duration * 1000
		});

		reactions.on("collect", (reaction, user) => {
			const { name } = reaction.emoji;
			if (message.author.id == user.id && name === terminateEmoji)
				return reactions.stop();
		});

		reactions.on("end", async () => {
			const pollResults = [];
			description = "The poll has ended!\nHere are the results:\n\n";	
			for (let i = 0; i < pollOptions.length; i++) {
				const reaction = prompt.reactions.cache.find(r => r.emoji.name === this.emojis[i]);
				const result = (reaction?.count) ? reaction.count - 1 : 0;
				pollResults.push(result);
				description += `\`${i}: "${pollOptions[i]}" - ${result} vote(s)\`\n`;
			}

			const embed = new EmbedBuilder(prompt.embeds[0].toJSON())
				.setDescription(description);

			prompt.reactions.removeAll();
			await prompt.edit({ embeds: [embed] });
		});
	}

	async immediatePoll(message: Message, args: string[]): Promise<MessageCreateOptions> {
		return {};
	}

	/**
	 * TODO: Factor out the single response waiting
	 * 
	 * @param message 
	 * @returns 
	 */
	async responsePoll(message: Message): Promise<MessageCreateOptions | null> {
		const MAX_TRIES = 5;
		const settings: AwaitMessagesOptions = {
			filter: m => m.author.id === message.author.id,
			time: 60_000,
			max: 1,
			errors: ["time"]
		};

		if (!(message.channel instanceof TextChannel)) // intellisense
			return {content: "Something went wrong!"};
			
		const prompt = await message.channel.send("Enter the title of your poll:");

		if (!message.member) throw new Error();

		try {

			const pollTitle: Message | undefined = (await message.channel.awaitMessages(settings)).first();

			if (!pollTitle) throw new Error();
				
			const title = pollTitle?.content || "You entered an image, didn't you >:(";
			await this.client.deleteMessage(pollTitle, 0);
			
			// Allow user to input the number of options for the poll
			await prompt.edit("Enter the number of options you want your poll to have:")
			let numOptions: number = await this.promptForSingleValue(
				message, settings, MAX_TRIES, "Please select between 2 and 5 poll options!",
				(n: number) => isNaN(n) || (n < 2 || n > 5)
			);
						
			if (isNaN(numOptions)) { // If the user is silly too many times, reject command
				this.client.deleteMessage(prompt);
				return this.rejectArgs({ content: "Too many failed attempts. Please run the poll command again." }, 
					message.member.id);
			}

			
			// @ts-ignore
			// Filter allows the user to send all numOptions messages before continuing
			settings.time *= numOptions / 2;
			settings.max = numOptions; 
			
			// Collect poll options from the user
			const pollOptions: string[] = [];
			
			prompt.edit({content: `Send ${numOptions} messages, each one with a different poll option:`});

			const responses = await message.channel.awaitMessages(settings)
			responses.forEach((msg: Message) => pollOptions.push(msg.content || "Couldn't understand this entry!"));
			
			// Delete response messages
			await message.channel.bulkDelete(responses.size, true);
			responses.clear();

			// Return settings to default
			settings.max = 1;
			settings.time = 60_000;
			let tries = 0;

			// Prompt the user to modify their poll if necessary
			while (tries < MAX_TRIES) {
				let validate = "Your entries can be seen below, should any of the options be changed?\n";
				validate += "\n> 0: Everything is good, let's proceed."
				for (let i = 0; i < pollOptions.length; i++) {
					validate += `\n> ${i + 1}: ${pollOptions[i]}.`
				}
				
				await prompt.edit({ content: validate });

				const response = (await message.channel.awaitMessages(settings)).first();
				if (!response) throw new Error();

				const optionSelect = parseInt(response.content);

				await this.client.deleteMessage(response, 0);
				
				if (isNaN(optionSelect) || optionSelect > pollOptions.length || optionSelect < 0) { // Loop again; tell user off for being silly
					tries++;
					message.channel.send({ 
						content: `Please select between 0 and ${pollOptions.length}!`
					}).then((msg: Message) => this.client.deleteMessage(msg, 5_000));

					continue;

				} else if (optionSelect == 0)
					break;

				await prompt.edit({ content: `Enter the new option for entry ${optionSelect}` });

				const optionEdit = (await message.channel.awaitMessages(settings)).first();
				pollOptions[optionSelect - 1] = optionEdit?.content || "Couldn't understand this entry!";

				await this.client.deleteMessage(optionEdit, 0);
			}

			// user kept inputting bad values, terminate command
			if (tries === MAX_TRIES) { 
				this.client.deleteMessage(prompt);
				return this.rejectArgs({ content: "TODO: Think of something for this message" }, message.member.id);
			}

			await prompt.edit({ content: "Enter the length of the poll in seconds (30 - 300): " })
			// Prompt user for the length of the poll
			let duration = await this.promptForSingleValue(
				message, settings, MAX_TRIES, "Please enter a time in seconds between 30 and 300.", 
				(n: number) =>  isNaN(n) || (n < 30 || n > 300)
			);
			
			// user entered kept entering bad values, terminate command
			if (isNaN(duration)) { 
				this.client.deleteMessage(prompt);
				return this.rejectArgs({ content: "Too many failed attempts. Please run the poll command again." }, 
					message.member.id);
			}

			// start the poll
			await this.poll(message, title, prompt, pollOptions, duration);

		} catch (error) {
			// Delete the prompt message
			console.log(error);
			
			this.client.deleteMessage(prompt);

			return this.rejectArgs({ content: "You took too long to respond! Please run the poll command again." },
				message.member.id);
		}
		
		return null;
	}

	async promptForSingleValue(message: Message, settings: AwaitMessagesOptions, 
		MAX_TRIES: number = 5, failMsg: string, invalid: Function): Promise<number> {
		
		let value = NaN;
		for (let i = 0; i < MAX_TRIES && invalid(value); i++) {
			
			const response = (await message.channel.awaitMessages(settings)).first();
			if (response)
				value = parseInt(response?.content);

			if (invalid(value)) { // loop again, tell off the user for being silly
				message.channel.send({
					content: failMsg
				}).then((msg: Message) => this.client.deleteMessage(msg, 5_000));
			}

			// delete the users response
			await this.client.deleteMessage(response, 0);
		}

		return value;
	}
}
