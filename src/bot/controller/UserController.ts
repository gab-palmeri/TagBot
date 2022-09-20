import { Context } from 'grammy';

import { joinTag, getGroupTags, getSubscribers, leaveTag, getSubscriberTags } from '../services/userServices';

export default class UserController {

	static async join(ctx: Context) {

		const tagName = ctx.match.toString();

		if(tagName.length == 0) 
			return await ctx.reply("⚠️ Syntax: /join tagname");

		const groupId = ctx.update.message.chat.id;
		const username = ctx.update.message.from.username;

		const response = await joinTag(groupId, tagName, username);
		const message = response.state === "ok" ? `Joined tag ${tagName}` : "⚠️ " + response.message;
		await ctx.reply(message, { reply_markup: { remove_keyboard: true }});
	}

	//CONTROLLARE SE L'UTENTE è EFFETTIVAMENTE ISCRITTO ALLA NOTIF
	static async leave(ctx: Context) {

		const tagName = ctx.match.toString();

		if(tagName.length == 0)
			return await ctx.reply('⚠️ Syntax: /leave tagname');

		const groupId = ctx.update.message.chat.id;
		const username = ctx.update.message.from.username;
		const response = await leaveTag(groupId, tagName, username);
		const message = response.state === "ok" ? `Left tag ${tagName}` : "⚠️ " + response.message;
		await ctx.reply(message, {reply_markup: { remove_keyboard: true } });
	}

	static async tag(ctx: Context) {

		//extrat the tag from ctx.match, which can be in between normal text
		const tagName = ctx.match[1];

		const messageToReplyTo = ctx.update.message.reply_to_message ? ctx.update.message.reply_to_message.message_id : ctx.msg.message_id;

		const groupId = ctx.update.message.chat.id;
		const response = await getSubscribers(tagName, groupId);

		if(response.state == "error") {
			await ctx.reply("⚠️ " + response.message, {reply_markup: { remove_keyboard: true } });
			return;
		}

		const users: string[] = response.payload.map(user => "@" + user);
		await ctx.reply(users.join(" "), {
			reply_to_message_id: messageToReplyTo,
			reply_markup: { remove_keyboard: true }
		});	
	}

	static async list(ctx: Context) {

		const groupId = ctx.update.message.chat.id;
		const response = await getGroupTags(groupId);

		if(response.state == "error") {
			await ctx.reply("⚠️ " + response.message);
			return;
		}

		//create a fancy message with the tags list
		const message = "📄 *Here's a list of all the tags in this group:*\n\n" + response.payload.map((tag) => {
			if(tag.subscribers.length == 1)
				return "- " + tag.name + " _(1 sub)_";
			else
				return "- " + tag.name + " _(" + tag.subscribers.length + " subs)_";
		}).join("\n");

		await ctx.reply(message, { parse_mode: "Markdown" });
	}

	//function that returns the tags the user is subcribed in
	static async myTags(ctx: Context) {
		
		const groupId = ctx.update.message.chat.id;
		const username = ctx.update.message.from.username;

		const response = await getSubscriberTags(username, groupId);

		if(response.state == "error")
			return await ctx.reply("⚠️ " + response.message);

		const message = "📄 *Here's a list of the tags you're in:*\n\n" + response.payload.map((tag) => "- " + tag.name).join("\n");

		await ctx.reply(message, { parse_mode: "Markdown" });
	}
}
