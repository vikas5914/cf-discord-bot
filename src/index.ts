import {
	Button,
	Components,
	DiscordHono,
	Modal,
	TextInput,
	createRest,
} from "discord-hono";
import { getCaptcha, getCode, solveCaptcha } from "./utils";

const app = new DiscordHono()
	.command("ping", (c) => c.res("pong!"))
	.command("redeem", (c) => {
		const code = getCode(c.var["gift-code"] as string);
		return c.res({
			content: `Redeem code: ${code}\nChoose a game:`,
			components: new Components().row(
				new Button("capybarago", "Capybarago", "Secondary").custom_id(
					JSON.stringify({
						code: code,
						game: "capybarago",
					})
				),
				new Button("survivorio", "Survivorio", "Secondary").custom_id(
					JSON.stringify({
						code: code,
						game: "survivorio",
					})
				),
				new Button("delete-self", "Delete", "Danger")
			),
		});
	})
	.component("delete-self", (c) => c.update().resDefer((c) => c.followup()))
	.component("capybarago", (c) =>
		c.update().resDefer(async (c) => {
			const meta = JSON.parse(c.var.custom_id ?? "");
			const { captchaId, imageBlob } = await getCaptcha(meta.game);

			await c.followup(
				{
					content: `Game ID: ${meta.code}`,
					components: new Components().row(
						new Button("captcha-input", "Solve Captcha").custom_id(
							JSON.stringify({
								code: meta.code,
								game: meta.game,
								captchaId: captchaId,
							})
						)
					),
				},
				{ blob: imageBlob, name: "captcha.png" }
			);
		})
	)
	.component("survivorio", (c) =>
		c.update().resDefer(async (c) => {
			const meta = JSON.parse(c.var.custom_id ?? "");
			const { captchaId, imageBlob } = await getCaptcha(meta.game);

			await c.followup(
				{
					content: `Game ID: ${meta.code}`,
					components: new Components().row(
						new Button("captcha-input", "Solve Captcha").custom_id(
							JSON.stringify({
								code: meta.code,
								game: meta.game,
								captchaId: captchaId,
							})
						)
					),
				},
				{ blob: imageBlob, name: "captcha.png" }
			);
		})
	)
	.component("captcha-input", (c) => {
		const meta = JSON.parse(c.var.custom_id ?? "");
		return c.resModal(
			new Modal("captcha-input-modal", "Solve Captcha")
				.row(new TextInput("captcha-input-value", "Enter the captcha code"))
				.custom_id(
					JSON.stringify({
						code: meta.code,
						game: meta.game,
						captchaId: meta.captchaId,
					})
				)
		);
	})
	.modal("captcha-input-modal", (c) =>
		c.update().resDefer(async (c) => {
			const meta = JSON.parse(c.var.custom_id ?? "");

			const captcha = c.var["captcha-input-value"] as string;

			if (!captcha) {
				return c.followup({
					content: "No captcha code provided. Please try again.",
				});
			}

			const result = await solveCaptcha(
				meta.game,
				meta.code,
				meta.captchaId,
				captcha
			);

			return c.followup({
				content: result,
				components: [],
				attachments: [],
			});
		})
	);

export default app;
