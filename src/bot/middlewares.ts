import { Context, NextFunction } from "grammy";
import { Group } from "../entity/Group";
import { Tag } from "../entity/Tag";

export async function checkIfGroup(ctx: Context, next) {

	if(['group','supergroup','channel'].includes(ctx.update.message.chat.type) == false) {
		await ctx.reply("This command can only be used in a group");
		return;
	}
	await next();
}

export async function checkIfPrivate(ctx: Context, next) {

	if(ctx.update.message.chat.type != 'private') {
		await ctx.reply("This command can only be used in a private chat");
		return;
	}
	await next();
}

export async function checkIfAdmin(ctx: Context, next) {

	const user = await ctx.getChatMember(ctx.update.message.from.id);

	if(["creator", "administrator"].includes(user.status) == false) {
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

	if(user.status == "creator" || user.status == "administrator") {
		await next();
	}
	else {
		const group = await Group.findOne({where: {groupId: ctx.msg.chat.id}});

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
		return true;
	}
	else {

		const groupId = ctx.msg.chat.id;
		const tagName = ctx.match.toString();
		const userId = ctx.msg.from.id;

		const group = await Group.findOne({where: {groupId: ctx.msg.chat.id}});
		const tag = await Tag.findOne({relations: ["group"], where: {name: tagName, group: {groupId: groupId}}});

		//print the name of the command
		const commandName = ctx.msg.text.split(/\s+/)[0].substring(1);

		switch(commandName) {
			case "delete":
				group.canDelete == 1 || (group.canDelete == 2 && tag.creatorId == userId) ? await next() :
				group.canDelete == 2 && tag.creatorId == 0 ? await ctx.reply("This tag was created before permissions were implemented, so only admins can delete it") :
				await ctx.reply("You don't have permission to delete this tag");
				break;
			case "rename":
				group.canRename == 1 || (group.canRename == 2 && tag.creatorId == userId) ? await next() :
				group.canRename == 2 && tag.creatorId == 0 ? await ctx.reply("This tag was created before permissions were implemented, so only admins can rename it") :
				await ctx.reply("You don't have permission to rename this tag");
				break;
			case "addusers":
				group.canAddUsers == 1 || (group.canAddUsers == 2 && tag.creatorId == userId) ? await next() :
				group.canAddUsers == 2 && tag.creatorId == 0 ? await ctx.reply("This tag was created before permissions were implemented, so only admins can add users to it") :
				await ctx.reply("You don't have permission to add users to this tag");
				break;
			case "remusers":
				group.canRemUsers == 1 || (group.canRemUsers == 2 && tag.creatorId == userId) ? await next() :
				group.canRemUsers == 2 && tag.creatorId == 0 ? await ctx.reply("This tag was created before permissions were implemented, so only admins can remove users from it") :
				await ctx.reply("You don't have permission to remove users from this tag");
				break;
		}
	}
}

