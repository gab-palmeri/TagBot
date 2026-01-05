import { Bot, GrammyError, HttpError, session } from "grammy";
import { sequentialize } from "@grammyjs/runner";
import { getSessionKey } from "./utils/middlewares";
import { limit } from "@grammyjs/ratelimiter";
import { autoRetry } from "@grammyjs/auto-retry";
import i18n from "utils/i18n";

import { Groups, LastUsedTags, MyContext } from 'utils/customTypes';

import { tagbotCommands, devCommands } from "commands";
import { listenersGroup, listenersPrivate} from "listeners";

import settingsPanel from "settings-menu/settingsPanel";

export default async function initializeBot() {
	const bot = new Bot<MyContext>(process.env.BOT_TOKEN);

	const sessionConfig = session({
		getSessionKey,
		initial: () => ({
			groups: [] as Groups,
			selectedGroup: null,
			lastUsedTags: [] as LastUsedTags
		}),
	});

	const errorHandler = async (err) => {
		err.error instanceof GrammyError
			? console.error('Error in request:', err.error.description)
			: err.error instanceof HttpError
			? console.error('Could not contact Telegram:', err.error)
			: console.error('Unknown error:', err.error);

		const messageToReplyTo = err.ctx.msg?.message_id;
		if(err.ctx.t && err.ctx.t instanceof Function)
			await err.ctx.reply(err.ctx.t("internal-error"), { reply_parameters: { message_id: messageToReplyTo }});
	};

	const rateLimits = limit({
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
		
		keyGenerator: (ctx) => ctx.from.id.toString() + "-" + ctx.chatId.toString(),
	});


	//Set the basic error handler
	bot.catch(errorHandler);
	bot.api.config.use(autoRetry());
	bot.use(sequentialize(getSessionKey));
	bot.use(sessionConfig);
	bot.use(i18n);
	bot.use(rateLimits);
	bot.use(settingsPanel);
	bot.use(tagbotCommands);
	bot.filter((ctx) => ctx.from?.id.toString() == process.env.OWNER_TELEGRAM_ID).use(devCommands);
	bot.use(listenersGroup);
	bot.use(listenersPrivate);
	await tagbotCommands.setCommands(bot); 
	return bot;
}