import { Bot, GrammyError, HttpError, session } from "grammy";
import { run, sequentialize } from "@grammyjs/runner";
import { getSessionKey } from "./middlewares";
import { limit } from "@grammyjs/ratelimiter";
import { autoRetry } from "@grammyjs/auto-retry";
import { apiThrottler } from "@grammyjs/transformer-throttler";

import GeneralComposer from "./composer/GeneralComposer";
import AdminComposer from "./composer/AdminComposer";
import SubscriberComposer from "./composer/SubscriberComposer";
import TagComposer from "./composer/TagComposer";


import {MyContext} from './customTypes';

import controlPanel from "./menu/settings/controlPanel";

export default class TagBot {

	private bot: Bot<MyContext>;

	constructor(token: string) {
		this.bot = new Bot<MyContext>(token);

		//Set the bot commands list
		this.bot.api
            .setMyCommands([
				{command: "start", description: "Start the bot"},
                { command: 'create', description: 'Create a new grouptag' },
                { command: 'delete', description: 'Delete a grouptag' },
				{ command: 'rename', description: 'Rename a grouptag' },
				{ command: 'restart', description: 'Restart the bot' },
				{ command: 'settings', description: 'Change the settings of the bot in private' },
                { command: 'join', description: 'Join a grouptag' },
                { command: 'leave', description: 'Leave a grouptag' },
                { command: 'list', description: 'List all the grouptags' },
                { command: 'mytags', description: 'List all the grouptags you are subscribed to' },
				{ command: 'help', description: 'Show the list of commands' },
            ])
            .catch(console.error);

		//Set the basic error handler
		this.bot.catch((err) => {
            console.error(`Error while handling update ${err.ctx.update.update_id}:`);

			err.error instanceof GrammyError
                ? console.error('Error in request:', err.error.description)
                : err.error instanceof HttpError
                ? console.error('Could not contact Telegram:', err.error)
                : console.error('Unknown error:', err.error);
        });

		//Set the session middleware and initialize session data
		this.bot.use(sequentialize(getSessionKey));
		this.bot.use(session({getSessionKey, initial: () => ({groups: [], selectedGroup: null, lastUsedTags: []})}));

		//Set the auto-retry middleware
		this.bot.api.config.use(autoRetry());

		//Set the menus
		this.bot.use(controlPanel);

		const throttler = apiThrottler();
		this.bot.api.config.use(throttler);

		this.setRateLimits();
		this.setCommands();
	}

	public setCommands() {

		//ADMIN COMMANDS
		this.bot.use(AdminComposer);

		//GENERAL COMMANDS
		this.bot.use(GeneralComposer);
		
		//SUBSCRIBER COMMANDS
		this.bot.use(SubscriberComposer);

		//TAG COMMANDS
		this.bot.use(TagComposer);

		
	}

	public setTransformers() {
		//This code setups auto-deletion of bot messages after 5 seconds
		this.bot.on(["message::bot_command", "callback_query"], async (ctx, next) => {
			ctx.api.config.use(async (prev, method, payload, signal) => {

				const res = await prev(method, payload, signal);
				if(ctx.chat.type !== "private" && method === "sendMessage" && "result" in res) {

					//get the command name
					const commandName = ctx.msg.text.split(/\s+/)[0];

					//If we are in the JOIN CALLBACK QUERY edge case, don't delete the user message. (there isn't any! it's a callback query)
					if(commandName.startsWith("/")) {
						try {
							await ctx.deleteMessage();
						} catch (error) {
							console.log(`[T] Could not delete user message "${ctx.msg.text}" from the group ${ctx.chat.title} (${ctx.chat.id}) because the bot is not an admin`);
						}
					}

					//The rename command is a special case -> do not delete it
					if(commandName !== "/rename") {
						//the /list or /help commands need more time to be deleted
						let timeToWait = 5000;
						if(commandName.startsWith("/list") || commandName.startsWith("/help") || commandName.startsWith("/join")) {
							timeToWait = 10000;
						}

						setTimeout(async () => {
							try {
								await ctx.api.deleteMessage(ctx.chat.id, res.result["message_id"]);
							} catch(error) {
								console.log(`[T] Could not delete bot message "${ctx.msg.text}" from the group ${ctx.chat["title"]} (${ctx.chat.id})`);
							}
						}, timeToWait);
					}
				}
				return res;
			});
			await next();
		});
	}

	public setRateLimits() {
		//Set up the user-side rate limiter, only for commands
		this.bot.filter(ctx => ctx.has("::bot_command")).use(limit({
			timeFrame: 5000,
			limit: 3,
			onLimitExceeded: async (ctx) => {
				try {
					await ctx.deleteMessage();
				} catch (error) {
					let groupInfo: string | number;
					if(ctx.chat.type !== "private")
						groupInfo = `${ctx.chat.title} (${ctx.chat.id})`;
					else 
						groupInfo = ctx.chat.id;

					console.log(`[R] Could not delete the message "${ctx.msg.text}" from the group ${groupInfo} because the bot is not an admin`);
				}

				const issuerUsername = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
				const msg = await ctx.reply("🕑 " + issuerUsername + ", wait some time before sending another command.");
				setTimeout(async (groupInfo) => {
					try {
						await ctx.api.deleteMessage(ctx.chat.id, msg.message_id);
					} catch (error) {
						console.log(`[R] Could not delete the message "${ctx.msg.text}" from the group ${groupInfo}`);
					}
				}, 3000);
			},
			
			keyGenerator: (ctx) => ctx.from?.id.toString() + "-" + ctx.chat.id.toString(),
		}));
	}

	public async start() {
		const runner = run(
			this.bot, 
			500, 
			{allowed_updates: ["message", "callback_query", "my_chat_member", "chat_member"]},
			{retryInterval: 1000}
		);

		const stopRunner = () => runner.isRunning() && runner.stop();
		process.once("SIGINT", stopRunner);
		process.once("SIGTERM", stopRunner);
	}

	//bot getter
	public getBot() {
		return this.bot;
	}
}
