import * as dotenv from 'dotenv';
import express from 'express';
import { webhookCallback } from 'grammy';
dotenv.config();

import { AppDataSource } from "./data-source";
import TagBot from "./bot/TagBot";

AppDataSource.initialize().then(async () => {

	const bot = new TagBot(process.env.BOT_TOKEN);

	const app = express();
	app.use(express.json());
	app.use(webhookCallback(bot.getBot(), 'express'));
	//await bot.start();

	const port = process.env.PORT || 8080; // Google Cloud Function uses this environment variable
	app.listen(port, () => {
		console.log(`Server running on port ${port}`);
	});

	console.log("started");


}).catch(error => console.log(error));
