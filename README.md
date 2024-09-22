# SCEBot2
Bot for the Systems and Computer Enginering Society (SCESoc) Discord server.

This is the current development version of SCEBot, and will be written in
TypeScript with the latest supported version of discord.js.

With the intent of creating a traditional message command based bot, the commands
are implemented using an Object Oriented design pattern, allowing for a quick
and easy implementation of new commands using existing templates.

A modular system is also being kept in mind as this project develops. Ideally, 
users can fork this repository and need to make little to no tweaks to the source
code in order to run their own version of SCEBot.

Once the original functionality from SCEBot1/blooBot has been ported over to 
SCEBot2, development of commands using Discord's more modern command implementation features
such as slash commands, buttons, forms, etc. can begin. 

- [SCEBot2](#scebot2)
  - [How to set up SCEBot for development](#how-to-set-up-scebot-for-development)
    - [Cloning](#cloning)
    - [Dependencies](#dependencies)
    - [Environment Variables](#environment-variables)
    - [Config](#config)
  - [Commands](#commands)
    - [Making a new command](#making-a-new-command)

## How to set up SCEBot for development

### Cloning
Clone this repository by running this command in your terminal:
```
git clone https://github.com/Brethan/SCEBot2.git
```

### Dependencies

Discord js is a library that runs in NodeJS. [The discord.js guide](https://discordjs.guide/preparations/#installing-node-js) gives details on how to install NodeJS for your operating system. Installing NodeJS will install the Node Package Manager (npm) along with it.

This project uses yarn for package management. To install yarn run the following command in your terminal:
```
npm install -g yarn
```


Once you have have NodeJS, npm, and yarn installed, clone this repo into your file system and open a terminal in the base directory of the project.


Run the following command:
```
yarn install
```

This will install all the necessary dependencies for this project.

### Environment Variables
SCEBot uses environment variables and will not be able to login without them. Running SCEBot for the first time will generate a .env file with a single key `BOT_TOKEN`. 

This `BOT_TOKEN` key is where you should copy and paste your bot's Discord Application token.

To start the bot, run the following command:
```
npm run start
```


### Config
SCEBot also uses a config file to store a prefix for running commands as well as important role / member ids. You must get these ids manually from a Discord server. This will require that you enable [Developer Mode](https://support-dev.discord.com/hc/en-us/articles/360028717192-Where-can-I-find-my-Application-Team-Server-ID).

SCEBot will automatically generate its config file after running it for the second time. See the [previous section](#environment-variables) for the command to start SCEBot.

You can right click on guild members to copy their user id and you can right click on roles to copy their role id:

![](./images/userid.png)

The following fields in the config file needs to be filled out:

```json
{
	"prefix":"",
	"elevated_roles": {
        "maintainer": "", // This should be a user id
        "moderator": "",
        "admin": "",
        "exec": "",
        "member": ""
    }
}

```

## Commands
The primary way for guild members to interact with SCEBot is through commands. This project uses an object oriented approach towards developing new commands.

There are 4 basic fields for commands:
```ts
interface Options {
    "name": string,
    "description": string,
    "elevatedRole": ElevatedRole,
    "autoclear": number
}

enum ElevatedRole {
    MEMBER,
    MODERATOR,
    ADMIN,
    EXECUTIVE,
    MAINTAINER
}
```

The name and the description explain what the command is and what it does. The elevated role field describes the role requirements to use the command. The autoclear field is the length of time before a successful bot response will be deleted from the channel.

### Making a new command
To make a new command, first the following 3 questions should be answered:
1. What will this command do? This will help in the development of the command.
2. Who can use this command? This will let you select which elevated role to assign to it.
3. Where can this command be used? This will restrict where it can be used.

The command file structure is as follows (as of 2024-09-21): 
```
./src/commands
   ├── Commands.ts
   ├── carleton/
   ├── maintainer/
   ├── member/
   ├── moderator/
   └── admin/
```
Source files for a new command should be created in one of these folders. After created the file, copy and paste the contents of the [template](./src/commands/template/template.ts) into the new command source file.   
You will need to:
1. Change the name of the class.
2. Change the command name.
3. Change the command description.
4. Change the elevated role according to your requirements.
5. Implement the textCommand method
