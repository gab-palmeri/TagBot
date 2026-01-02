import { Bot, GrammyError, HttpError, session } from "grammy";
import { sequentialize } from "@grammyjs/runner";
import { getSessionKey } from "./utils/middlewares";
import { limit } from "@grammyjs/ratelimiter";
import { autoRetry } from "@grammyjs/auto-retry";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import tagbotCommands from "commands";
import { listenersGroup, listenersPrivate} from "listeners";

import { Groups, LastUsedTags, MyContext } from '@utils/customTypes';
import controlPanel from "@utils/menu/controlPanel";

export default async function initializeBot() {
	const bot = new Bot<MyContext>(process.env.BOT_TOKEN);

	//Set the basic error handler
	bot.catch(async (err) => {
		console.error(`Error while handling update ${err.ctx.update.update_id}:`);
		err.error instanceof GrammyError
			? console.error('Error in request:', err.error.description)
			: err.error instanceof HttpError
			? console.error('Could not contact Telegram:', err.error)
			: console.error('Unknown error:', err.error);

		const messageToReplyTo = err.ctx.msg.message_id;
		await err.ctx.reply("⚠️ An internal error occurred. Please try again later.", { reply_to_message_id: messageToReplyTo });
	});

	//Set the session middleware and initialize session data
	bot.use(sequentialize(getSessionKey));
	bot.use(session({
		getSessionKey,
		initial: (): MyContext["session"] => ({
			groups: [] as Groups,
			selectedGroup: null,
			lastUsedTags: [] as LastUsedTags,
		}),
	}));

	//Set the auto-retry middleware
	bot.api.config.use(autoRetry());

	//Set the menus
	bot.use(controlPanel);

	const throttler = apiThrottler();
	bot.api.config.use(throttler);

	// Set commands and listeners
	bot.use(tagbotCommands);
	await tagbotCommands.setCommands(bot); 
	bot.use(listenersGroup);
	bot.use(listenersPrivate);

	// Rate limits
	bot.filter(ctx => ctx.has("::bot_command")).use(limit({
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

	return bot;
}