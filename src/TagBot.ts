import { Bot, GrammyError, HttpError, session } from "grammy";
import { run, sequentialize } from "@grammyjs/runner";
import { getSessionKey } from "./shared/middlewares";
import { limit } from "@grammyjs/ratelimiter";
import { autoRetry } from "@grammyjs/auto-retry";
import { apiThrottler } from "@grammyjs/transformer-throttler";

import GroupComposer from "features/group/group.composer";
import AdminComposer from "features/admin/admin.composer";
import SubscriberComposer from "features/subscriber/subscriber.composer";
import TagComposer from "features/tag/tag.composer";
import UserComposer from "features/user/user.composer";


import {Groups, LastUsedTags, MyContext} from '@utils/customTypes';
import controlPanel from "@utils/menu/controlPanel";

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
		this.bot.use(session({
			getSessionKey,
			initial: (): MyContext["session"] => ({
				groups: [] as Groups,
				selectedGroup: null,
				lastUsedTags: [] as LastUsedTags,
			}),
		}));

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
		this.bot.use(GroupComposer);

		//TAG COMMANDS
		this.bot.use(TagComposer);
		
		//SUBSCRIBER COMMANDS
		this.bot.use(SubscriberComposer);

		//USER COMMANDS
		this.bot.use(UserComposer);
	
	}

	public setRateLimits() {
		//Set up the user-side rate limiter, only for commands
		this.bot.filter(ctx => ctx.has("::bot_command")).use(limit({
			timeFrame: 5000,
			limit: 3,
			onLimitExceeded: async (ctx: MyContext) => {

				if(ctx.chat == undefined || !ctx.msg || !ctx.from) return;

				try {
					await ctx.deleteMessage();
				} catch(e) {
					let groupInfo: string | number;
					if(ctx.chat.type !== "private")
						groupInfo = `${ctx.chat.title} (${ctx.chat?.id})`;
					else 
						groupInfo = ctx.chat.id;

					console.log(`[R] Could not delete the message "${ctx.msg.text}" from the group ${groupInfo} because the bot is not an admin`);
				}

				const issuerUsername = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
				const msg = await ctx.reply("🕑 " + issuerUsername + ", wait some time before sending another command.");
				const chatId = ctx.chat.id.toString();

				const receivedMsg = ctx.msg.text;
				setTimeout(async (groupInfo) => {
					try {
						await ctx.api.deleteMessage(chatId, msg.message_id);
					} catch(e) {
						console.log(`[R] Could not delete the message "${receivedMsg}" from the group ${groupInfo}`);
					}
				}, 3000);
			},
			
			keyGenerator: (ctx) => ctx.from?.id.toString() + "-" + ctx.chat?.id.toString(),
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
