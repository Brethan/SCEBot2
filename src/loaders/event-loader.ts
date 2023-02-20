import { lstatSync, readdirSync } from "fs";
import { resolve } from "path";
import SCESocClient from "../Client";

module.exports = async (client: SCESocClient) => {
	// Get the subfolders in ./src/events
	const dir = "./src/events";
	const eventFolders = readdirSync(resolve(dir))
		.filter(f => lstatSync(resolve(dir, f)).isDirectory());
	
	const loadEvents = (folder: string) => {
		const eventPath = resolve(dir, folder);
		const eventFiles = readdirSync(eventPath)
			.filter(file => file.endsWith(".ts"));

		// Loop through files in events/<dir>/; ready event		
		for (const file of eventFiles) {
			const event = require(resolve(eventPath, file));
			const eventName = file.split('.').at(0);
			
			if (!eventName)
				continue;
				
			client.on(eventName, event.bind(null, client));
		}	

	}

	// Load all of the <event>.ts files
	eventFolders.forEach(folder => loadEvents(folder))
}
