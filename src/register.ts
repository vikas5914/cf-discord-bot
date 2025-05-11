import { Command, Option, register } from "discord-hono";

const commands = [
	new Command("hello", "response world"),
	new Command("help", "response help").options(new Option("text", "with text")),
	new Command("redeem", "redeem a gift code").options(
		new Option("gift-code", "gift code to redeem").required()
	),
];

register(
	commands,
	process.env.DISCORD_APPLICATION_ID,
	process.env.DISCORD_TOKEN
);
