import { Message } from "discord.js"
const emojis = ["🇸", "🇹", "🇮", "🇳", "🇰", "🇾"];
export const blockedMessage = async (message: Message) => {
	if (!message.member) return;

	const content = message.content.toLowerCase();
	if (!content.includes("blocked message")) return;

	for (const emoji of emojis) {
		await message.react(emoji);
	}
}