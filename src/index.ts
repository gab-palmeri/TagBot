import * as dotenv from 'dotenv'
dotenv.config();

import { AppDataSource } from "./data-source";
import TagBot from "./bot/TagBot";

AppDataSource.initialize().then(async () => {

	const bot = new TagBot(process.env.BOT_TOKEN);
	await bot.start();

	console.log("started");


}).catch(error => console.log(error));
