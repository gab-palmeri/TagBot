import initializeBot from "./initializeBot";
import { run } from '@grammyjs/runner';

if (!process.env.BOT_TOKEN) {
	throw new Error("BOT_TOKEN is not defined in environment variables");
}

const bot = await initializeBot();

await bot.api.deleteWebhook({ drop_pending_updates: true });
const runner = run(
	bot,
	500,
	{allowed_updates: ["message", "callback_query", "my_chat_member", "chat_member"], drop_pending_updates: true},
	{retryInterval: 1000}
);

const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);

console.log("Bot started in long polling mode");

await initializeBot();