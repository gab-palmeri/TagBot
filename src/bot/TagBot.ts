import { Bot, GrammyError, HttpError, session } from "grammy";
import { run, sequentialize } from "@grammyjs/runner";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import { getSessionKey } from "./middlewares";

import GeneralComposer from "./composer/GeneralComposer";
import AdminComposer from "./composer/AdminComposer";
import UserComposer from "./composer/UserComposer";


import MyContext from './MyContext';
import menu from "./menu/ControlPanel";

export default class TagBot {

	private bot: Bot<MyContext>;

	constructor(token: string) {
		this.bot = new Bot<MyContext>(token);

		this.bot.api
            .setMyCommands([
				{command: "start", description: "Start the bot"},
                { command: 'create', description: 'Create a new grouptag' },
                { command: 'delete', description: 'Delete a grouptag' },
				{ command: 'rename', description: 'Rename a grouptag' },
                { command: 'addusers', description: 'Add multiple users to a grouptag' },
				{ command: 'remusers', description: 'Remove multiple users from a grouptag'},
				{ command: 'restart', description: 'Restart the bot' },
				{ command: 'settings', description: 'Change the settings of the bot in private' },
                { command: 'join', description: 'Join a grouptag' },
                { command: 'leave', description: 'Leave a grouptag' },
                { command: 'list', description: 'List all the grouptags' },
                { command: 'mytags', description: 'List all the grouptags you are subscribed to' },
				{ command: 'help', description: 'Show the list of commands' },
            ])
            .catch(console.error);

		this.bot.catch((err) => {
            console.error(`Error while handling update ${err.ctx.update.update_id}:`);

			err.error instanceof GrammyError
                ? console.error('Error in request:', err.error.description)
                : err.error instanceof HttpError
                ? console.error('Could not contact Telegram:', err.error)
                : console.error('Unknown error:', err.error);
        });

		this.bot.use(sequentialize(getSessionKey));
		this.bot.use(session({getSessionKey, initial: () => ({groups: []})}));

		const throttler = apiThrottler();
		this.bot.api.config.use(throttler);

		this.bot.use(menu);

		this.setCommands();
	}

	public setCommands() {

		//ADMIN COMMANDS
		this.bot.use(AdminComposer);

		//USER COMMANDS
		this.bot.use(UserComposer);

		//GENERAL COMMANDS
		this.bot.use(GeneralComposer);
	}

	public start() {
		const runner = run(this.bot, 500, {allowed_updates: ["message", "callback_query", "my_chat_member", "chat_member"]});

		const stopRunner = () => runner.isRunning() && runner.stop();
		process.once("SIGINT", stopRunner);
		process.once("SIGTERM", stopRunner);
	}
}
