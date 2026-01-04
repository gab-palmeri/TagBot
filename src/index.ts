import * as dotenv from 'dotenv';
import express from 'express';
import { webhookCallback } from 'grammy';
dotenv.config();

import initializeBot from "./initializeBot";
import { run } from '@grammyjs/runner';

if (!process.env.BOT_TOKEN) {
	throw new Error("BOT_TOKEN is not defined in environment variables");
}


if(process.env.MODE == "polling") {

	const bot = await initializeBot();
	const runner = run(
		bot,
		500,
		{allowed_updates: ["message", "callback_query", "my_chat_member", "chat_member"], drop_pending_updates: true},
		{retryInterval: 1000}
	);

	const stopRunner = () => runner.isRunning() && runner.stop();
	process.once("SIGINT", stopRunner);
	process.once("SIGTERM", stopRunner);

	console.log("Bot started in long polling mode");

}

else if (process.env.MODE == "webhook") {

	const bot = await initializeBot();

	const app = express();
	const port = process.env.PORT || 8080;
	app.use(express.json());
	app.use(webhookCallback(bot, 'express'));
	app.listen(port, () => {
		console.log(`Starting on webhook at port ${port}`);
	});
}

await initializeBot();