import { Context } from 'grammy';

import { createTag, deleteTag } from '../services/adminServices';
import { getTag, joinTag, leaveTag } from '../services/userServices';


export default class AdminController {

	static async create(ctx: Context) {
	
		const tagName = ctx.match.toString();

		//tagName must be at least 5 characters long and can contain only letters, numbers and underscores
		const regex = /^[a-zA-Z0-9_]{5,32}$/;

		if(tagName.length == 0)
			return await ctx.reply("⚠️ Syntax: /create tagname");

		if(tagName.length < 5 || !regex.test(tagName)) 
			return await ctx.reply("⚠️ Tag must be at least 5 characters long and can contain only letters, numbers and underscores");
		
		
		const groupId = ctx.update.message.chat.id;
		const response = await createTag(groupId, tagName);
		const message = response.state === "ok" ? `✅ Created tag ${tagName}` : "⚠️ " + response.message;
		await ctx.reply(message);
	}

	static async delete(ctx: Context) {
        const tagName = ctx.match.toString();
        if (tagName.length == 0)
            return await ctx.reply('⚠️ Syntax: /delete tagname');

        const groupId = ctx.update.message.chat.id;
        const response = await deleteTag(groupId, tagName);
        const message = response.state === 'ok' ? `✅ Deleted tag ${tagName}` : "⚠️ " + response.message;
        await ctx.reply(message, { reply_markup: { remove_keyboard: true } });
    }

	static async addUsers(ctx: Context) {

		const args = ctx.match.toString();
		const [tagName, ...usernames] = args.trim().split(/\s+/);

		//check if the usernames are valid telegram usernames starting with @ and if tag name is valid
		const usernameRegex = /^@[a-zA-Z0-9_]{5,32}$/;
		const tagNameRegex = /^[a-zA-Z0-9_]{5,32}$/;

		if(!tagNameRegex.test(tagName))
			return await ctx.reply("⚠️ Tag must be at least 5 characters long and can contain only letters, numbers and underscores");

		if(usernames.length == 0) 
			return await ctx.reply("⚠️ Syntax: /addusers tagname @username1 @username2 ...");

		const tag = await getTag(ctx.update.message.chat.id, tagName);
		if(tag.state !== "ok") 
			return await ctx.reply("⚠️ " + tag.message);
		

		const groupId = ctx.update.message.chat.id;
		const validUsernames = [];
		const alreadyInUsernames = [];
		const invalidUsernames = [];

		for(const username of usernames) {

			if(!usernameRegex.test(username)) {
				invalidUsernames.push(username);
				continue;
			}

			const response = await joinTag(groupId, tagName, username.substring(1));
			if(response.state === "ok")
				validUsernames.push(username);
			else if(response.state === "ALREADY_SUBSCRIBED")
				alreadyInUsernames.push(username);
		}

		//build reply message based on the results
		const addedMessage = validUsernames.length > 0 ? "✅ Added " + validUsernames.join(", ") + " to tag " + tagName : "";
		const alreadyInMessage = alreadyInUsernames.length > 0 ? "⚠️ Already in tag: " + alreadyInUsernames.join(", ") : "";
		const invalidMessage = invalidUsernames.length > 0 ? "🚫 Invalid usernames: " + invalidUsernames.join(", ") : "";

		await ctx.reply(addedMessage + "\n" + alreadyInMessage + "\n" + invalidMessage);
	}

	static async remUsers(ctx: Context) {
        
        const args = ctx.match.toString();
        const [tagName, ...usernames] = args.trim().split(/\s+/);

        //check if the usernames are valid telegram usernames starting with @ and if tag name is valid
        const usernameRegex = /^@[a-zA-Z0-9_]{5,32}$/;
        const tagNameRegex = /^[a-zA-Z0-9_]{5,32}$/;

        if (!tagNameRegex.test(tagName) || usernames.length == 0)
            return await ctx.reply('⚠️ Syntax: /remusers tagname @username1 @username2 ...');

        const tag = await getTag(ctx.update.message.chat.id, tagName);
        if (tag.state !== 'ok') return await ctx.reply(tag.message);

        const groupId = ctx.update.message.chat.id;

        const validUsernames = [];
        const alreadyInUsernames = [];
        const invalidUsernames = [];

        for (const username of usernames) {
            if (!usernameRegex.test(username)) {
                invalidUsernames.push(username);
                continue;
            }

            const response = await leaveTag(groupId, tagName, username.substring(1));
            if (response.state === 'ok') 
				validUsernames.push(username);
            else if (response.state === 'NOT_SUBSCRIBED') 
				alreadyInUsernames.push(username);
        }

        //build reply message based on the results
        const removedMessage = validUsernames.length > 0 ? '✅ Removed ' + validUsernames.join(', ') + ' from tag ' + tagName : '';
        const notInMessage = alreadyInUsernames.length > 0 ? '⚠️ Not in tag: ' + alreadyInUsernames.join(', ') : '';
        const invalidMessage = invalidUsernames.length > 0 ? '🚫 Invalid usernames: ' + invalidUsernames.join(', ') : '';

        await ctx.reply(removedMessage + '\n' + notInMessage + '\n' + invalidMessage);
    }

}
