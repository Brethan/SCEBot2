import { Client, Collection, ClientOptions, Message, GuildMember, TextChannel, BaseGuildTextChannel } from "discord.js";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { ElevatedRole } from "./commands/Command";
import { resolve } from "path";

import Command from "./commands/Command";
import { aliasProgramMap } from "./data/course_map";

interface Channels {
	[key: string]: string,
	log: string,
	roles: string,
	lobby: string,
	interact: string,
	reception: string,
	announcement: string
}

interface IElevatedRole {
	maintainer: string,
	moderator: string,
	admin: string,
	exec: string,
	member: string
}

interface Config {
	prefix: string,
	elevated_roles: IElevatedRole,
	channels: Channels,
	guild_id: string,
	gitpull: string
}

export default class SCESocClient extends Client {
	config: Config;

	commands: Collection<string, Command>;
	
	/** @readonly */
	specialChannels: Collection<string, BaseGuildTextChannel>;

	/** @readonly */
	elevated_roles: Map<ElevatedRole, string>;

	/** @readonly */
	aliasToProgram: Map<string, string>;

	constructor(options: ClientOptions) {
		super(options);

		this.config = JSON.parse(readFileSync(resolve("./", "config.json"), "utf8"));

		this.commands = new Collection();
		
		this.elevated_roles = new Map<ElevatedRole, string>();
		this.elevated_roles.set(ElevatedRole.MAINTAINER, this.maintainer)
		this.elevated_roles.set(ElevatedRole.EXECUTIVE, this.exec)
		this.elevated_roles.set(ElevatedRole.ADMIN, this.admin)
		this.elevated_roles.set(ElevatedRole.MODERATOR, this.moderator)
		this.elevated_roles.set(ElevatedRole.MEMBER, this.member)

		this.aliasToProgram = aliasProgramMap;
		
		this.specialChannels = new Collection<string, BaseGuildTextChannel>();
		this.initLoaders();
	}

	async initLoaders() {
		
		readdirSync(resolve("./src/loaders/"))
			.filter(f => f.endsWith("loader.ts"))
			.forEach(async loader_name => require(`./loaders/${loader_name}`)(this))
	}

	get logChannel() {
		return <BaseGuildTextChannel>this.specialChannels.get(this.config.channels.log);
	}
	
	get rolesChannel(): BaseGuildTextChannel {
		return <BaseGuildTextChannel>this.specialChannels.get(this.config.channels.roles);
	}
	
	get lobbyChannel() {
		return <BaseGuildTextChannel>this.specialChannels.get(this.config.channels.lobby);
	}
	
	get receptionChannel() {
		return <BaseGuildTextChannel>this.specialChannels.get(this.config.channels.reception);
	}

	get announcementChannel() {
		return <BaseGuildTextChannel>this.specialChannels.get(this.config.channels.announcement);
	}

	
	
	/**
	 * @readonly
	 */
	get prefix(): string {
		return this.config.prefix;
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

	get member(): string {
		return this.config.elevated_roles.member;
	}

	isMemberModerator(member: GuildMember): boolean {
		if (this.isMemberAdmin(member) || this.isMemberExec(member) || this.isMemberMaintainer(member))
			return true;

		return member.roles.cache.some(r => r.id === this.moderator);
	}

	isMemberAdmin(member: GuildMember): boolean {
		if (this.isMemberExec(member) || this.isMemberMaintainer(member))
			return true;

		return member.roles.cache.some(r => r.id === this.admin);
	}

	isMemberExec(member: GuildMember): boolean {
		if (this.isMemberMaintainer(member))
			return true;

		return member.roles.cache.some(r => r.id === this.exec);
	}

	isMemberMaintainer(member: GuildMember): boolean {
		return this.maintainer === member.id;
	}

	/**
	 * Injects a delay into the runtime of a given code block
	 * @param delay duration of sleep
	 */
	async sleep(delay: number = 5_000) {
		await new Promise(resolve => setTimeout(resolve, delay));
	}

	#log(message: string) {
		console.log(`[${(new Date()).toISOString()}] ${message}`);
	}

	debug(message: string) {
		this.#log("DEBUG: " + message);
	}

	logWarning(message: string) {
		this.#log("WARNING: " + message);
	}
	
	logNotice(message: string) {
		this.#log("NOTICE: " + message);
	}
	
	logError(message: string) {
		this.#log("ERROR: " + message);
	}
	
	logInfo(message: string) {
		this.#log("INFO: " + message);
	}

	/**
	 * Deletes a message after a certain delay. If no delay is passed,
	 * the message will be deleted after 5 seconds by default.
	 * 
	 * @param message 
	 * @param delay number of ms before message is deleted
	 */
	async deleteMessage(message: Message | undefined, delay = 5_000) {
		
		if (!message)
			return;
			
		try {
			await this.sleep(delay);
			await message.delete();
		} catch (e) {
			console.log("ERROR: Could not delete a message, it may have been deleted already.");
		}
	}

	set gitpull(msgId: string) {
		this.config.gitpull = msgId;
		this.overwriteConfig();
	}

	get gitpull() {
		const temp = this.config.gitpull;
		return temp;
	}

	overwriteConfig() {
		const overwrite = JSON.stringify(this.config, null, 4);
		writeFileSync("./config.json", overwrite);
	}
}
