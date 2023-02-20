import { GuildMember, Message, MessageCreateOptions, Snowflake } from "discord.js";
import SCESocClient from "../Client";

interface Options {
	name: string,
	description?: string,
	elevatedRole: ElevatedRole,
	autoclear?: number
}

export enum ElevatedRole {
	MEMBER,
	MODERATOR,
	ADMIN,
	EXECUTIVE,
	MAINTAINER
}

export class CommandUnimplementedError extends Error {
	command: string;
	constructor(name: string) {
		super(`Command ${name} has not been implemented yet!`);
		this.command = name;
	}
}

export default class Command {
	client: SCESocClient;
	
	/** the name of this command */
	name: string;
	
	/** short description explaining what this command does */
	description: string;

	/** amount of time before (successful) command output is deleted */
	autoclear: number

	/** Specified the elevator role required to use this command */
	elevatedRole: ElevatedRole;

	autoclearOverride: Map<string, number>;

	constructor(client: SCESocClient, options: Options) {

		this.client = client
		this.name = options.name
		this.description = options.description || options.name;
		this.elevatedRole = options.elevatedRole;
		this.autoclear = options.autoclear || -1;
		this.autoclearOverride = new Map<string, number>();
	}

	/**
	 * 
	 * Implements the functionality of this command.
	 * Returns a valid response type that can be sent using TextChannel.send()
	 * 
	 * @param _message 
	 * @param _args
	 * @abstract
	 * @throws {CommandUnimplementedError}
	 */
	async textCommand(_message: Message, _args: String[]): Promise<MessageCreateOptions | null> {
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
		const elevationRoleMap = this.client.elevated_roles;
		const requiredId = elevationRoleMap.get(this.elevatedRole);

		if (!requiredId)
			return false;
		
		// While the maintainer is working on commands, they should be able to use them
		// if (member.id === elevationRoleMap.get(ElevatedRole.MAINTAINER))
		// 	return true; // Comment out after testing is complete

		switch (this.elevatedRole) {
			case ElevatedRole.MEMBER:
				return true
			case ElevatedRole.MAINTAINER: // Is steve
				return member.id === this.client.maintainer;
			default:
				return memberRoles.has(requiredId);
		}
	}

	/**
	 * Adds to a map of this commands overridden autoclears
	 * The command handler will use the members autoclear instead of
	 * this.autoclear once before deleting it.
	 * 
	 * @param tempAutoclear amount of time before response is deleted
	 */
	setOverrideAutoclear(memberId: Snowflake, tempAutoclear: number) {
		this.autoclearOverride.set(memberId, tempAutoclear);
	}

	/**
	 * Easy to use template for rejecting a users args.
	 * 
	 * Promptly deletes the message after the user has some time to 
	 * find out what went wrong.
	 * 
	 * @param options payload to send to the server
	 * @param tempAutoclear time before the reject will be deleted
	 * @returns 
	 */
	rejectArgs(options: MessageCreateOptions, memberId: Snowflake, tempAutoclear = 10_000): MessageCreateOptions {
		this.setOverrideAutoclear(memberId, tempAutoclear);
		return options;
	}
}
