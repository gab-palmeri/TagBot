import * as dotenv from 'dotenv';
import express from 'express';
import { webhookCallback } from 'grammy';
dotenv.config();

import TagBot from "./TagBot";


	if (!process.env.BOT_TOKEN) {
		throw new Error("BOT_TOKEN is not defined in environment variables");
	}

	const bot = new TagBot(process.env.BOT_TOKEN);

	if(process.env.MODE == "polling") {
		void bot.start().then(() => {
			console.log("Bot started in long polling mode");
		});
	}
	else if (process.env.MODE == "webhook") {
		const app = express();
		const port = process.env.PORT || 8080;
		app.use(express.json());
		app.use(webhookCallback(bot.getBot(), 'express'));
		app.listen(port, () => {
			console.log(`Starting on webhook at port ${port}`);
		});
	}
	
