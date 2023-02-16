import SCESocClient from "src/Client";

module.exports = async (client: SCESocClient) => {
	console.log(`${client.user.tag} is ready!`);
}