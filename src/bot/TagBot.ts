import { Bot, Context, GrammyError, HttpError, session, SessionFlavor } from "grammy";
import { run, sequentialize } from "@grammyjs/runner";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import { checkIfGroup, checkIfAdmin, getSessionKey, checkIfPrivate } from "./middlewares";

import AdminController from "./controller/AdminController";
import UserController from "./controller/UserController";
import GeneralController from "./controller/GeneralController";

import menu from "./ControlPanel";

type MyContext = Context & SessionFlavor<{groups: {groupName:string, groupId:number}[]}>;

export default class TagBot {

	private bot: Bot<MyContext>;

	constructor(token: string) {
		this.bot = new Bot<MyContext>(token);

		this.bot.api
            .setMyCommands([
                { command: 'create', description: 'Create a new grouptag' },
                { command: 'delete', description: 'Delete a grouptag' },
				{ command: 'rename', description: 'Rename a grouptag' },
                { command: 'addusers', description: 'Add multiple users to a grouptag' },
				{ command: 'remusers', description: 'Remove multiple users from a grouptag'},
                { command: 'join', description: 'Join a grouptag' },
                { command: 'leave', description: 'Leave a grouptag' },
                { command: 'list', description: 'List all the grouptags' },
                { command: 'mytags', description: 'List all the grouptags you are subscribed to' },
				{ command: 'help', description: 'Show the list of commands' },
				{ command: 'restart', description: 'Restart the bot' }
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
		this.bot.command("create", checkIfGroup, checkIfAdmin, AdminController.create);
		this.bot.command('delete', checkIfGroup, checkIfAdmin, AdminController.delete);
		this.bot.command('rename', checkIfGroup, checkIfAdmin, AdminController.rename);
		this.bot.command('addusers', checkIfGroup, checkIfAdmin, AdminController.addUsers);
		this.bot.command('remusers', checkIfGroup, checkIfAdmin, AdminController.remUsers);
		this.bot.command("settings", checkIfPrivate, AdminController.controlPanel);

		//USER COMMANDS
		this.bot.command("join", checkIfGroup, UserController.join); 
		this.bot.command("leave", checkIfGroup, UserController.leave);
		this.bot.on("::hashtag", checkIfGroup, UserController.tag);
		this.bot.command("list", checkIfGroup, UserController.list);
		this.bot.command("mytags", checkIfGroup, UserController.myTags);

		//GENERAL COMMANDS
		this.bot.command("start", GeneralController.start);
		this.bot.command("help", GeneralController.help);
		this.bot.command("restart", checkIfGroup, checkIfAdmin, GeneralController.restart);

		this.bot.on(["message:new_chat_members:me", "message:group_chat_created", "message:supergroup_chat_created"], GeneralController.onGroupJoin);
		this.bot.on("my_chat_member", GeneralController.onGroupPromotion);
		this.bot.on(":migrate_to_chat_id", GeneralController.onGroupMigrate);
		this.bot.on("chat_member", GeneralController.onMemberChange);

	}

	public start() {
		const runner = run(this.bot, 500, {allowed_updates: ["message", "callback_query", "my_chat_member", "chat_member"]});

		const stopRunner = () => runner.isRunning() && runner.stop();
		process.once("SIGINT", stopRunner);
		process.once("SIGTERM", stopRunner);
	}
}
