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

type GiftCodeResponse = {
	code: number;
	message: string;
};

export async function getCaptcha(gameName: GameName): Promise<CaptchaResult> {
	const baseUrl =
		gameName === "capybarago"
			? "https://prod-mail.habbyservice.com/Capybara/api/v1/captcha"
			: "https://prod-mail.habbyservice.com/Survivor/api/v1/captcha";

	// Generate captcha ID
	const generateResponse = await fetch(`${baseUrl}/generate`, {
		headers: {
			accept: "application/json",
			"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
			pragma: "no-cache",
			"user-agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
		},
		referrer: "https://gift.capybarago.io/",
		referrerPolicy: "strict-origin-when-cross-origin",
		body: null,
		method: "POST",
	});

	const responseData = (await generateResponse.json()) as CaptchaResponse;
	const captchaId = responseData.data.captchaId;

	// Fetch captcha image
	const imageResponse = await fetch(`${baseUrl}/image/${captchaId}`, {
		headers: {
			accept: "application/json",
			"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
			pragma: "no-cache",
			"user-agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
		},
		referrer: "https://gift.capybarago.io/",
		referrerPolicy: "strict-origin-when-cross-origin",
		body: null,
		method: "GET",
	});
	const blob = new Blob([await imageResponse.arrayBuffer()]);

	return {
		captchaId,
		imageBlob: blob,
	};
}

export async function solveCaptcha(
	gameName: GameName,
	code: string,
	captchaId: string,
	captcha: string
): Promise<string> {
	try {
		const baseUrl =
			gameName === "capybarago"
				? "https://prod-mail.habbyservice.com/Capybara/api/v1/giftcode/claim"
				: "https://prod-mail.habbyservice.com/Survivor/api/v1/giftcode/claim";

		const userId = gameName === "capybarago" ? "11605599" : "104063632";

		console.log({
			baseUrl,
			userId: userId,
			giftCode: code,
			captchaId: captchaId,
			captcha: captcha,
		});

		const response = await fetch(baseUrl, {
			method: "POST",
			headers: {
				accept: "application/json",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
				pragma: "no-cache",
				"user-agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
			},
			referrer: "https://gift.capybarago.io/",
			referrerPolicy: "strict-origin-when-cross-origin",
			body: JSON.stringify({
				userId: userId,
				giftCode: code,
				captchaId: captchaId,
				captcha: captcha,
			}),
		});

		if (!response.ok) {
			return `API request failed with status ${response.status}`;
		}

		const data = (await response.json()) as GiftCodeResponse;
		const message = codeMessages.find((m) => m.code === data.code)?.message;
		return message || data.message || data.code.toString();
	} catch (error) {
		return error instanceof Error ? error.message : "An unknown error occurred";
	}
}

export function getCode(codeOrUrl: string) {
	if (codeOrUrl.includes("https://")) {
		const url = new URL(codeOrUrl);
		return url.searchParams.get("code");
	}
	return codeOrUrl;
}

const codeMessages = [
	{
		code: 0,
		message:
			"Congratulations! Your rewards have been sent to your in-game Mailbox. Go and check it out!",
	},
	{ code: 20001, message: "Redeem failed; information incorrect" },
	{ code: 20002, message: "Redeem failed; incorrect Verification Code" },
	{
		code: 20003,
		message: "Oh no, we suspect your ID is incorrect. Please check again.",
	},
	{
		code: 20401,
		message:
			"Oh no, we suspect your Rewards Code is incorrect. Please check again.",
	},
	{ code: 20402, message: "Oh no, your Rewards Code has already been used!" },
	{ code: 20403, message: "Oh no, your Rewards Code has expired..." },
	{
		code: 20404,
		message: "Redeem code is not activated, please try it later.",
	},
	{
		code: 20409,
		message:
			"This redemption code has already been redeemed and can no longer be redeemed.",
	},
	{ code: 20407, message: "Codes of similar items can only be claimed once." },
	{
		code: 20410,
		message: "You are temporarily unable to redeem this gift code.",
	},
	{ code: 30001, message: "Server is busy, please try again." },
];
