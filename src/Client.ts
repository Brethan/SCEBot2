import { Client, Collection, ClientOptions, Message } from "discord.js";
import { readdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import config from "../config.json";
import Command from "./commands/Command";

export type Config = typeof config;

export default class SCESocClient extends Client {
	config: Config;
	commands: Collection<string, Command>;

	constructor(options: ClientOptions) {
		super(options);

		this.config = config;

		this.commands = new Collection();
		
		this.initLoaders();
	}

	async initLoaders() {
		
		readdirSync(resolve("./src/loaders/"))
			.filter(f => f.endsWith("loader.ts"))
			.forEach(async loader_name => require(`./loaders/${loader_name}`)(this))
	}
	
	/**
	 * @readonly
	 */
	get prefix(): string {
		return this.config.prefix;
	}

	get elevated_roles(): string[] {
		const roles: string[] = [];
		for (const role in this.config.elevated_roles) {
			roles.push(this.config.elevated_roles[role]);
		}

		return roles;
	}
	
	get maintainer(): string {
		return this.config.elevated_roles.maintainer;
	}
	
	get exec(): string {
		return this.config.elevated_roles.exec;
	}
	
	get admin(): string {
		return this.config.elevated_roles.admin;
	}
	
	get moderator(): string {
		return this.config.elevated_roles.moderator;
	}

	/**
	 * Injects a delay into the runtime of a given code block
	 * @param delay duration of sleep
	 */
	async sleep(delay: number = 5_000) {
		await new Promise(resolve => setTimeout(resolve, delay));
	}

	/**
	 * Deletes a message after a certain delay. If no delay is passed,
	 * the message will be deleted after 5 seconds by default.
	 * 
	 * @param message 
	 * @param delay number of ms before message is deleted
	 */
	async deleteMessage(message: Message, delay = 5_000) {
		
		try {
			await this.sleep(delay);
			await message.delete();
		} catch (e) {
			console.log("ERROR: Could not delete a message, it may have been deleted already.");
		}
	}

	overwriteConfig() {
		const overwrite = JSON.stringify(this.config, null, 4);
		writeFileSync("./config.json", overwrite);
	}
}
