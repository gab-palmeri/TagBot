import { InlineKeyboard, NextFunction } from "grammy";

import GroupRepository from "db/group/group.repository";
import TagRepository from "db/tag/tag.repository";
import { MyContext } from "./customTypes";

export async function checkIfPrivate(ctx: MyContext, next: NextFunction) {

	if(!ctx.hasChatType("private")) {
		const inlineKeyboard = new InlineKeyboard().url(ctx.t("private-only-btn"), "https://t.me/grouptags_bot?start");
		await ctx.reply(ctx.t("private-only"), { parse_mode: "HTML", reply_markup: inlineKeyboard});
		return;
	}
	await next();
}

export function getSessionKey(ctx: MyContext) {
  return ctx.chat?.id.toString();
}


export async function canCreate(ctx: MyContext, next: NextFunction) {

	if(!ctx.update.message || !ctx.msg || !ctx.msg.from) return;

	const user = await ctx.getChatMember(ctx.update.message.from.id);
	const groupId = ctx.msg.chat.id.toString();

	if(user.status == "creator" || user.status == "administrator") {
		await next();
	}
	else {
		const groupRepository = new GroupRepository();
		const group = await groupRepository.getGroup(groupId);

		if(group.canCreate == 1) {
			await next();
		}
		else {
			await ctx.reply(ctx.t("permissions.create-tags-admin"));
		}
	}	
}


export async function canUpdate(ctx: MyContext, next: NextFunction) {

	if(!ctx.update.message || !ctx.msg || !ctx.msg.from || !ctx.match || !ctx.msg.text) return;

	const user = await ctx.getChatMember(ctx.update.message.from.id);

	if(user.status == "creator" || user.status == "administrator") {
		await next();
	}
	else {

		const groupId = ctx.msg.chat.id.toString();
		const tagName = ctx.match.toString();
		const userId = ctx.msg.from.id.toString();

		const tagRepository = new TagRepository();
		const groupRepository = new GroupRepository();

		const group = await groupRepository.getGroup(groupId);

		const tagResult = await tagRepository.get(group.id, tagName);
		if(tagResult === null) {
			await ctx.reply(ctx.t("tag.validation-not-found", {tagName, count: 1}));
			return;
		}
		

		const commandName = ctx.msg.text.split(/\s+/)[0].substring(1);

		switch (commandName) {
			case "delete":
				if (group.canDelete === 1 || (group.canDelete === 2 && tagResult.creatorId === userId)) {
					await next();
				} 
				else if (group.canDelete === 2) {
					await ctx.reply(ctx.t("permissions.delete-tags-admins-or-creator"));
				} 
				else {
					await ctx.reply(ctx.t("permissions.delete-tags-admins"));
				}
				break;

			case "rename":
				if (group.canRename === 1 || (group.canRename === 2 && tagResult.creatorId === userId)) {
					await next();
				} 
				else if (group.canRename === 2) {
					await ctx.reply(ctx.t("permissions.rename-tags-admins-or-creator"));
				} 
				else {
					await ctx.reply(ctx.t("permissions.rename-tags-admins"));
				}
				break;
		}
	}
}

