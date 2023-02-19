import SCESocClient from "../Client";
import Command from "../commands/Command";
import { readdirSync } from "fs";
import { resolve } from "path";

module.exports = async (client: SCESocClient) => {
	// get all subfolders in ./src/commands
	const dir = "./src/commands";
	const commandFolders = readdirSync(resolve(dir))
		.filter(folder => !folder.endsWith(".ts"));
	
	for (const folder of commandFolders) {
		const commandFiles = readdirSync(resolve(dir, folder))
			.filter(file => file.endsWith(".ts"))

		// Loop through all files in folder and create command object	
		for (const file of commandFiles) {
			const SubCommand = require(resolve(dir, folder, file));
			// Reject class if unimplemented / empty
			if (!Object.keys(SubCommand).length)
				continue;

			// Forcibly call the constructor	
			const command: Command = new SubCommand["default"](client);
			
			// add the command to the collection
			client.commands.set(command.name, command);
		}
	}
}
