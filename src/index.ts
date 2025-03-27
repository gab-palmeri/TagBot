import * as dotenv from 'dotenv';
import express from 'express';
import { webhookCallback } from 'grammy';
dotenv.config();

import { AppDataSource } from "./data-source";
import TagBot from "./bot/TagBot";

AppDataSource.initialize().then(async () => {

	const bot = new TagBot(process.env.BOT_TOKEN);

	const app = express(); // or whatever you're using

	app.use(webhookCallback(bot.getBot(), 'express'));
	//await bot.start();

	console.log("started");


}).catch(error => console.log(error));
