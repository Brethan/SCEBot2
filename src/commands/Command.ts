import { GuildMember, Message, MessageCreateOptions } from "discord.js";
import SCESocClient from "../Client";

interface Options {
	name: string,
	description?: string,
	moderator?: boolean,
	admin?: boolean,
	maintainer?: boolean,
	exec?: boolean,
	autoclear?: number
}

export class CommandUnimplementedError extends Error {
	constructor(name: string) {
		super(`Command ${name} has not been implemented yet!`);
	}
}

export default class Command {
	client: SCESocClient;
	
	/** the name of this command */
	name: string;
	
	/** short description explaining what this command does */
	description: string;
	
	/** restricts command use to moderators and up */
	moderator: boolean;
	
	/** restricts command use to admins and up */
	admin: boolean;

	/** restricts command use to the maintainer (immutable) */
	maintainer: boolean;

	/** restricts command use to the execs (immutable) */
	exec: boolean;

	/** amount of time before (successful) command output is deleted */
	autoclear: number

	constructor(client: SCESocClient, options: Options) {

		this.client = client
		this.name = options.name
		this.description = options.description || options.name;
		this.maintainer = options.maintainer || false;
		this.moderator = options.moderator || false;
		this.admin = options.admin || false;
		this.exec = options.exec || false;
		this.autoclear = options.autoclear || -1;
	}

	/**
	 * 
	 * @param message 
	 * @param args
	 * @abstract
	 * @throws {CommandUnimplementedError}
	 */
	async textCommand(message: Message, args: String[]): Promise<MessageCreateOptions> {
		throw new CommandUnimplementedError(this.name);
	}

	/**
	 * Uses the fields for this command to see a member can use this command.
	 * 
	 * For example, if a command requires a guild member to be an admin,
	 * this function will check to see if the guild member has been given that role.
	 * 
	 * @param member the guild member who ran this command
	 * @returns true if the member can use this command, false otherwise
	 */
	validateUser(member: GuildMember): boolean {
		const { cache: memberRoles } = member.roles;
		const { maintainer, exec, admin, moderator } = this.client;
		
		if (this.maintainer && member.id !== maintainer)
			return false;
		else if (this.exec && !memberRoles.has(exec))
			return false;
		else if (this.admin && !memberRoles.has(admin)) 
			return false
		else if (this.moderator && !memberRoles.has(moderator)) {
			return false;
		}

		return true;
	}
}
