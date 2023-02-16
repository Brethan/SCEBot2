import { resolve } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

export const check_env = () => {
	if (!existsSync(resolve("./", ".env"))) {
		writeFileSync("./.env", "BOT_TOKEN =\n");
		throw new Error("Please enter your bot's token in the .env file!");
	}
}

export const check_config = () => {
	// Template for first run time
	const template = {
		"prefix": "",
		"channels": {
			"log": "",
			"roles": "",
			"lobby": "",
			"interact": "",
			"reception": "",
			"announcement": "",
		},
		"guild_id": "",
		"elevated_roles": {
			"maintainer": "",
			"moderator": "",
			"admin": "",
			"exec": ""
		}
	};

	let config = {};

	// Check if config exists and has all required entries
	if (existsSync(resolve("./", "config.json"))) {
		config = require("../config.json");
		for (const key in template) {
			if (config[key])
				continue;

			config[key] = template[key];
		}

	} else { // if config doesn't exist, make a template
		config = template;
	}

	writeFileSync("./config.json", JSON.stringify(config, null, 4) + "\n");
	if (config === template) {
		throw new Error("Please make sure to add the prefix and" +
			"elevated roles to the config.json file before continuing!")
	}
	
	return config;
};
