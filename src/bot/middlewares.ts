import { Context } from "grammy";

export async function checkIfGroup(ctx: Context, next) {

	if(['group','supergroup','channel'].includes(ctx.update.message.chat.type) == false) {
		ctx.reply("This command can only be used in a group");
		return;
	}
	await next();
}

export async function checkIfAdmin(ctx: Context, next) {

	const user = await ctx.getChatMember(ctx.update.message.from.id);

	if(["creator", "administrator"].includes(user.status) == false) {
		ctx.reply("You must be an admin to use this command");
		return;
	}
	await next();
}

export function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}