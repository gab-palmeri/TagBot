import { Context, InlineKeyboard, NextFunction } from "grammy";
import { Group } from "@db/entity/Group";
import { Tag } from "@db/entity/Tag";

export async function checkIfGroup(ctx: Context, next: NextFunction) {

	if(ctx.hasChatType('private')) {
		await ctx.reply("This command can only be used in a group");
		return;
	}
	await next();
}

export async function checkIfPrivate(ctx: Context, next: NextFunction) {

	if(!ctx.hasChatType("private")) {
		const inlineKeyboard = new InlineKeyboard().url("..press here!", "https://t.me/grouptags_bot?start");
		await ctx.reply("To use this command...", { reply_markup: inlineKeyboard});
		return;
	}
	await next();
}

export async function checkIfAdmin(ctx: Context, next: NextFunction) {

	const user = await ctx.getChatMember(ctx.update.message.from.id);

	if(user.status == "creator" || user.status == "administrator") {
		await ctx.reply("You must be an admin to use this command");
		return;
	}
	await next();
}

export function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}


export async function canCreate(ctx: Context, next: NextFunction) {

	const user = await ctx.getChatMember(ctx.update.message.from.id);
	const groupId = ctx.msg.chat.id.toString();

	if(user.status == "creator" || user.status == "administrator") {
		await next();
	}
	else {

		//inserire metodo servizio

		const group = await Group.findOne({where: {groupId: groupId}});

		if(group.canCreate == 1) {
			await next();
		}
		else {
			await ctx.reply("Only admin can create tags");
		}
	}	
}


export async function canUpdate(ctx: Context, next: NextFunction) {

	const user = await ctx.getChatMember(ctx.update.message.from.id);

	if(user.status == "creator" || user.status == "administrator") {
		await next();
	}
	else {

		const groupId = ctx.msg.chat.id.toString();
		const tagName = ctx.match.toString();
		const userId = ctx.msg.from.id.toString();

		const group = await Group.findOne({where: {groupId: groupId}});
		const tag = await Tag.findOne({relations: ["group"], where: {name: tagName, group: {groupId: groupId}}});

		//print the name of the command
		const commandName = ctx.msg.text.split(/\s+/)[0].substring(1);

		switch(commandName) {
			case "delete":
				group.canDelete == 1 || (group.canDelete == 2 && tag.creatorId == userId) ? await next() :
				group.canDelete == 2 && tag.creatorId == "0" ? await ctx.reply("This tag was created before permissions were implemented, so only admins can delete it") :
				group.canDelete == 2 ? await ctx.reply("Only admins or the creator of this tag can delete it") :
				await ctx.reply("Only admins can delete tags");
				break;
			case "rename":
				group.canRename == 1 || (group.canRename == 2 && tag.creatorId == userId) ? await next() :
				group.canRename == 2 && tag.creatorId == "0" ? await ctx.reply("This tag was created before permissions were implemented, so only admins can rename it") :
				group.canRename == 2 ? await ctx.reply("Only admins or the creator of this tag can rename it") :
				await ctx.reply("Only admins can rename tags");
				break;
		}
	}
}

