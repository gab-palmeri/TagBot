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
		const message = response.state === "ok" ? 
		'@' + username + ' joined tag ' + tagName + '. He will be notified when someone tags it.' : 
		"⚠️ " + response.message;

		await ctx.reply(message, { reply_markup: { remove_keyboard: true }});
	}

	static async leave(ctx: Context) {

		const tagName = ctx.match.toString();

		if(tagName.length == 0)
			return await ctx.reply('⚠️ Syntax: /leave tagname');

		const groupId = ctx.update.message.chat.id;
		const username = ctx.update.message.from.username;

		const response = await leaveTag(groupId, tagName, username);
		const message = response.state === "ok" ? 
		'@' + username + ' left tag ' + tagName + '. He will no longer be notified when someone tags it.' : 
		"⚠️ " + response.message;

		await ctx.reply(message, {reply_markup: { remove_keyboard: true } });
	}

	static async tag(ctx: Context) {

		if(ctx.msg.forward_date !== undefined)
			return;

		//get ALL tag names mentioned in the message
		const tagNames = ctx.msg.text ? ctx.msg.text.match(/#\w+/g) : ctx.msg.caption.match(/#\w+/g);
		const messageToReplyTo = ctx.update.message.reply_to_message ? ctx.update.message.reply_to_message.message_id : ctx.msg.message_id;
		const groupId = ctx.update.message.chat.id;

		const emptyTags = [];
		const nonExistentTags = [];

		//for every tag name, get the subcribers and create a set of unique user preceded by "@"
		//if the tag does not exist or is empty, add it to the corresponding array
		for(const tagName of tagNames) {
			const response = await getSubscribers(tagName.substring(1), groupId);

			switch(response.state) {
				case "ok": {
					const message = Array.from(response.payload.map(subscriber => "@" + subscriber)).join(" ") + "\n";
					await ctx.reply(message, { reply_to_message_id: messageToReplyTo });
					break;
				}	
				case "NOT_EXISTS":
					nonExistentTags.push(tagName);
					break;
				case "TAG_EMPTY":
					emptyTags.push(tagName);
					break;
			}
		}

		let errorMessages = "";

		emptyTags.length == 1 ?
		errorMessages += "⚠️ The tag " + emptyTags[0] + " is empty\n" :
		emptyTags.length > 1 ?
		errorMessages += "⚠️ These tags are empty: " + emptyTags.join(", ") + "\n" : null;

		nonExistentTags.length == 1 ? 
		errorMessages += "❌ The tag " + nonExistentTags[0] + " does not exist\n" : 
		nonExistentTags.length > 1 ?
		errorMessages += "❌ These tags do not exist: " + nonExistentTags.join(", ") : null;
		
		if(errorMessages.length > 0)
			await ctx.reply(errorMessages, { reply_to_message_id: messageToReplyTo });
	}

	static async list(ctx: Context) {

		const groupId = ctx.update.message.chat.id;
		const response = await getGroupTags(groupId);

		if(response.state == "error") {
			await ctx.reply("⚠️ " + response.message);
			return;
		}

		//create a fancy message with the tags list
		const message = "📄 <b>Here's a list of all the tags in this group:</b>\n\n" + response.payload.map((tag) => {
			if(tag.subscribers.length == 1)
				return "- " + tag.name + " <i>(1/50 sub)</i>";
			else
				return "- " + tag.name + " <i>(" + tag.subscribers.length + "/50 subs)</i>";
		}).join("\n");

		await ctx.reply(message, {parse_mode: "HTML"});
	}

	//function that returns the tags the user is subcribed in
	static async myTags(ctx: Context) {
		
		const groupId = ctx.update.message.chat.id;
		const username = ctx.update.message.from.username;

		const response = await getSubscriberTags(username, groupId);

		if(response.state == "error")
			return await ctx.reply("⚠️ " + response.message + ", @" + username);

		const message = "📄 <b>Here's a list of the tags you're in, @" + username + ":</b>\n\n" + 
		response.payload.map((tag) => "- " + tag.name).join("\n");

		await ctx.reply(message, { parse_mode: "HTML" });
	}
}
