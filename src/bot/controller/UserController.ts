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

		//get ALL tag names mentioned in the message
		const tagNames = ctx.msg.text.match(/#\w+/g);
		const messageToReplyTo = ctx.update.message.reply_to_message ? ctx.update.message.reply_to_message.message_id : ctx.msg.message_id;
		const groupId = ctx.update.message.chat.id;

		let emptyTags = [];
		let nonExistentTags = [];

		//for every tag name, get the subcribers and create a set of unique user preceded by "@"
		//if the tag does not exist or is empty, add it to the corresponding array
		const users = new Set<string>();
		for(const tagName of tagNames) {
			const response = await getSubscribers(tagName.substring(1), groupId);

			switch(response.state) {
				case "ok":
					response.payload.forEach(subscriber => users.add(`@${subscriber}`));
					break;
				case "NOT_EXISTS":
					nonExistentTags.push(tagName);
					break;
				case "TAG_EMPTY":
					emptyTags.push(tagName);
					break;
			}
		}

		//create a string with all the users plus the non existent and empty tags, if there are any
		let message = Array.from(users).join(" ") + "\n";

		emptyTags.length == 1 ?
		message += "⚠️ The tag " + emptyTags[0] + " is empty\n" :
		emptyTags.length > 1 ?
		message += "⚠️ The following tags are empty: " + emptyTags.join(", ") + "\n" : null;

		nonExistentTags.length == 1 ? 
		message += "❌ The tag " + nonExistentTags[0] + " does not exist\n" : 
		nonExistentTags.length > 1 ?
		message += "❌ The following tags do not exist: " + nonExistentTags.join(", ") : null;
		
		await ctx.reply(message, { reply_to_message_id: messageToReplyTo });
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
