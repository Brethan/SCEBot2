import { Message } from "discord.js"
import { transliterate as tr } from "transliteration";

const emojis = ["🇸", "🇹", "🇮", "🇳", "🇰", "🇾"];
const target = "blocked messages";
const isBlockedMessage = (content: string) => {
	if (target.match(content))
		return true;

	const split = content.split(/[^\w]|_/g);
	const firstLetters = split.map(str => str.charAt(0));
	const lastLetters = split.map(str => str.charAt(str.length - 1));

	const forwards = firstLetters.join("") + lastLetters.join("");
	const backwards = firstLetters.reverse().join("") + lastLetters.reverse().join("")

	if (target.match(forwards + backwards))
		return true;

	return false
}

export const blockedMessage = async (message: Message) => {
	if (!message.member) return;
	const content = tr(message.content.toLowerCase()).replace(/[^\w| ]|_/, " ")
	
	if (isBlockedMessage(content)) return;

	for (const emoji of emojis) {
		await message.react(emoji);
	}
}