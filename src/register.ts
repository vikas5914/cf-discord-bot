import { Command, Option, register } from "discord-hono";

const commands = [
	new Command("ping", "response pong"),
	new Command("redeem", "redeem a gift code").options(
		new Option("gift-code", "gift code to redeem").required()
	),
];

register(
	commands,
	process.env.DISCORD_APPLICATION_ID,
	process.env.DISCORD_TOKEN
);
