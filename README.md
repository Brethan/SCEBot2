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