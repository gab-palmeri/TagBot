import * as dotenv from 'dotenv';
import express from 'express';
import { webhookCallback } from 'grammy';
dotenv.config();

import { AppDataSource } from "./data-source";
import TagBot from "./bot/TagBot";

AppDataSource.initialize().then(async () => {

	const bot = new TagBot(process.env.BOT_TOKEN);

	if(process.env.ENVIRONMENT == "dev") {
		await bot.start();
		console.log("Starting on long polling");
	}
	else {
		const app = express();
		const port = process.env.PORT || 8080;
		app.use(express.json());
		app.use(webhookCallback(bot.getBot(), 'express'));
		app.listen(port, () => {
			console.log(`Starting on webhook at port ${port}`);
		});
	}
	
	

}).catch(error => console.log(error));
