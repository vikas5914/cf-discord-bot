type GameName = "capybarago" | "survivorio";
type CaptchaResponse = {
	code: number;
	data: {
		captchaId: string;
	};
};

type CaptchaResult = {
	captchaId: string;
	imageBlob: Blob;
};

export async function getCaptcha(gameName: GameName): Promise<CaptchaResult> {
	const baseUrl =
		gameName === "capybarago"
			? "https://prod-mail.habbyservice.com/Capybara/api/v1/captcha"
			: "https://prod-mail.habbyservice.com/Survivor/api/v1/captcha";

	// Generate captcha ID
	const generateResponse = await fetch(`${baseUrl}/generate`, {
		method: "POST",
	});
	const responseData = (await generateResponse.json()) as CaptchaResponse;
	const captchaId = responseData.data.captchaId;

	// Fetch captcha image
	const imageResponse = await fetch(`${baseUrl}/image/${captchaId}`);
	const blob = new Blob([await imageResponse.arrayBuffer()]);

	return {
		captchaId,
		imageBlob: blob,
	};
}
