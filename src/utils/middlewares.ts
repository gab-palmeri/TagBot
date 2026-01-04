import { InlineKeyboard, NextFunction } from "grammy";

import GroupRepository from "@db/group/group.repository";
import TagRepository from "@db/tag/tag.repository";
import { MyContext } from "./customTypes";

export async function checkIfPrivate(ctx: MyContext, next: NextFunction) {

	if(!ctx.hasChatType("private")) {
		const inlineKeyboard = new InlineKeyboard().url(ctx.t("private-only-button"), "https://t.me/grouptags_bot?start");
		await ctx.reply(ctx.t("private-only"), { parse_mode: "Markdown", reply_markup: inlineKeyboard});
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
		const groupResult = await groupRepository.getGroup(groupId);
		
		if(groupResult === null) {
			await ctx.reply(ctx.t("group-not-found"));
			return;
		}

		if(groupResult.canCreate == 1) {
			await next();
		}
		else {
			await ctx.reply(ctx.t("only-admins-create-tags"));
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

		const groupResult = await groupRepository.getGroup(groupId);
		if(groupResult === null) {
			await ctx.reply(ctx.t("group-not-found"));
			return;
		}

		const tagResult = await tagRepository.get(tagName, groupId);
		if(tagResult === null) {
			await ctx.reply(ctx.t("tag-not-found", {tagName}));
			return;
		}
		

		const commandName = ctx.msg.text.split(/\s+/)[0].substring(1);

		switch (commandName) {
			case "delete":
				if (groupResult.canDelete === 1 || (groupResult.canDelete === 2 && tagResult.creatorId === userId)) {
					await next();
				} 
				else if (groupResult.canDelete === 2) {
					await ctx.reply(ctx.t("only-admins-or-creator-delete"));
				} 
				else {
					await ctx.reply(ctx.t("only-admins-delete"));
				}
				break;

			case "rename":
				if (groupResult.canRename === 1 || (groupResult.canRename === 2 && tagResult.creatorId === userId)) {
					await next();
				} 
				else if (groupResult.canRename === 2) {
					await ctx.reply(ctx.t("only-admins-or-creator-rename"));
				} 
				else {
					await ctx.reply(ctx.t("only-admins-rename"));
				}
				break;
		}
	}
}

