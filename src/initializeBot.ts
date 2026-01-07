import { Bot, GrammyError, HttpError, session } from "grammy";
import { sequentialize } from "@grammyjs/runner";
import { getSessionKey } from "./utils/middlewares";
import { limit } from "@grammyjs/ratelimiter";
import { autoRetry } from "@grammyjs/auto-retry";
import i18n from "utils/i18n";

import { Groups, MyContext } from 'utils/customTypes';

import { tagbotCommands, devCommands } from "commands";
import { listenersGroup, listenersPrivate} from "listeners";

import settingsPanel from "settings-menu/settingsPanel";
import UserRepository from "db/user/user.repository";

export default async function initializeBot() {
	const bot = new Bot<MyContext>(process.env.BOT_TOKEN);

	const sessionConfig = session({
		getSessionKey,
		initial: () => ({
			groups: [] as Groups,
			selectedGroup: null
		}),
	});

	const errorHandler = async (err) => {

		err.error instanceof GrammyError
			? console.error('Error in request:', err.error.description)
			: err.error instanceof HttpError
			? console.error('Could not contact Telegram:', err.error)
			: console.error('Unknown error:', err.error);

		const messageToReplyTo = err.ctx.msg?.message_id;
		console.log(await err.ctx.i18n.getLocale());
		await err.ctx.reply(i18n.t(await err.ctx.i18n.getLocale(), "internal-error"), { reply_parameters: { message_id: messageToReplyTo }});
	};

	const usernameSynchronizer = async (ctx, next) => {
		const userRepository = new UserRepository();
		const user = await userRepository.getUser(ctx.from.id.toString());

		if(user != null && user.username !== ctx.from.username) {
			await userRepository.update(ctx.from.id.toString(), {username: ctx.from.username || ""});
		}
		await next();
	};

	const rateLimits = limit({
		timeFrame: 3000,
		limit: 3,
		alwaysReply: true,
		onLimitExceeded: async (ctx: MyContext) => {

			const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
			return await ctx.reply(ctx.t("flooding", { username }), {parse_mode: "HTML"});
		},
		
		keyGenerator: (ctx) => {
			if(ctx.callbackQuery?.data != null) {
				return null;
			}
			else {
				return ctx.from.id.toString() + "-" + ctx.chatId.toString();
			}
		},
	});


	
	bot.catch(errorHandler);
	bot.use(usernameSynchronizer);
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