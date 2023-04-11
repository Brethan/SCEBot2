import { Message } from "discord.js"
import { transliterate as tr } from "transliteration";

const emojis = ["🇸", "🇹", "🇮", "🇳", "🇰", "🇾"];
const target = "blocked messages";
const isBlockedMessage = (content: string) => {
	
	if (content.includes(target))
		return true;

	const split = content.split(/[^\w]|_/g);
	const firstLetters = split.map(str => str.charAt(0));
	const lastLetters = split.map(str => str.charAt(str.length - 1));

	const forwards = firstLetters.join("") + lastLetters.join("");
	const backwards = firstLetters.reverse().join("") + lastLetters.reverse().join("")

	if ((forwards + backwards).includes(target))
		return true;

	return false
}

export const blockedMessage = async (message: Message) => {
	const content = tr(message.content.toLowerCase()).replace(/[^\w| ]|_/, " ")
	
	if (!isBlockedMessage(content)) return;

	for (const emoji of emojis) {
		await message.react(emoji);
	}

	await new Promise(resolve => setTimeout(resolve, 5_000));
	await message.reactions.removeAll();
}