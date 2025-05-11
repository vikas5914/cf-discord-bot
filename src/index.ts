import { Button, Components, DiscordHono } from "discord-hono";
import { getCaptcha } from "./utils";

const app = new DiscordHono()
	.command("hello", (c) => c.res("world!"))
	.command("help", (c) =>
		c.res({
			content: `text: ${c.var.text}`,
			components: new Components().row(
				new Button("https://discord-hono.luis.fun", ["📑", "Docs"], "Link"),
				new Button("delete-self", ["🗑️", "Delete"], "Secondary")
			),
		})
	)
	.command("redeem", (c) =>
		c.res({
			content: `Redeem code: ${c.var["gift-code"]}\nChoose a game:`,
			components: new Components().row(
				new Button("capybarago", "Capybarago"),
				new Button("survivorio", "Survivorio")
			),
		})
	)
	.component("delete-self", (c) => c.update().resDefer((c) => c.followup()))
	.component("capybarago", (c) =>
		c.update().resDefer(async (c) => {
			const { captchaId, imageBlob } = await getCaptcha("capybarago");
			await c.followup(
				{
					content: `Followup captchaId: ${c.var["gift-code"]}`,
					components: new Components(),
				},
				{ blob: imageBlob, name: "captcha.png" }
			);
		})
	)
	.component("survivorio", (c) =>
		c.update().res({
			content: "You clicked: Survivorio",
			components: new Components(),
		})
	);

export default app;
