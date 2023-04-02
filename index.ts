import Client from "./src/Client";
import { check_config, check_env } from "./user_modules/file_check";

check_env();
check_config(); 

import { GatewayIntentBits } from "discord.js";
require("dotenv").config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.AutoModerationExecution,
	]
})

/**
 * Logs the bot into the Developer Portal application.
 * When running at startup as intended, internet connection
 * is not guaranteed so wait until one becomes available
 */
async function login() {
	const numMinutes = 10;
	const iterations = numMinutes * 60;

	for (let i = 0; i < iterations; i++) {
		try {
			await client.login(process.env.BOT_TOKEN);
			break;
		} catch (error) {
			console.log("Could not connect to Discord :(");
			await client.sleep(1_000);
		}
	}
}

login()

