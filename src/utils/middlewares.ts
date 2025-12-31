import { Context, InlineKeyboard, NextFunction } from "grammy";

import GroupRepository from "@db/group/group.repository";
import TagRepository from "@db/tag/tag.repository";

export async function checkIfPrivate(ctx: Context, next: NextFunction) {

	if(!ctx.hasChatType("private")) {
		const inlineKeyboard = new InlineKeyboard().url("..press here!", "https://t.me/grouptags_bot?start");
		await ctx.reply("To use this command...", { reply_markup: inlineKeyboard});
		return;
	}
	await next();
}

export function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}


export async function canCreate(ctx: Context, next: NextFunction) {

	if(!ctx.update.message || !ctx.msg || !ctx.msg.from) return;

	const user = await ctx.getChatMember(ctx.update.message.from.id);
	const groupId = ctx.msg.chat.id.toString();

	if(user.status == "creator" || user.status == "administrator") {
		await next();
	}
	else {
		const groupRepository = new GroupRepository();

		const groupResult = await groupRepository.getGroup(groupId);

		if(groupResult.ok === false) {
			switch(groupResult.error) {
				case "NOT_FOUND":
					await ctx.reply("Group not found");
					return;
				case "DB_ERROR":
					await ctx.reply("Internal error occurred");
					return;
			}
		}

		const group = groupResult.value;

		if(group.canCreate == 1) {
			await next();
		}
		else {
			await ctx.reply("Only admins can create tags");
		}
	}	
}


export async function canUpdate(ctx: Context, next: NextFunction) {

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
		if(groupResult.ok === false) {
			switch(groupResult.error) {
				case "NOT_FOUND":
					await ctx.reply("Group not found");
					return;
				case "DB_ERROR":
					await ctx.reply("Internal error occurred");
					return;
			}
		}

		const tagResult = await tagRepository.get(tagName, groupId);
		if(tagResult.ok === false) {
			switch(tagResult.error) {
				case "NOT_FOUND":
					await ctx.reply("Tag not found");
					return;
				case "DB_ERROR":
					await ctx.reply("Internal error occurred");
					return;
			}
		}

		const group = groupResult.value;
		const tag = tagResult.value;
		const commandName = ctx.msg.text.split(/\s+/)[0].substring(1);

		switch (commandName) {
			case "delete":
				if (group.canDelete === 1 || (group.canDelete === 2 && tag.creatorId === userId)) {
					await next();
				} 
				else if (group.canDelete === 2) {
					await ctx.reply("Only admins or the creator of this tag can delete it");
				} 
				else {
					await ctx.reply("Only admins can delete tags");
				}
				break;

			case "rename":
				if (group.canRename === 1 || (group.canRename === 2 && tag.creatorId === userId)) {
					await next();
				} 
				else if (group.canRename === 2) {
					await ctx.reply("Only admins or the creator of this tag can rename it");
				} 
				else {
					await ctx.reply("Only admins can rename tags");
				}
				break;
		}

	}
}

