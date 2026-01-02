import { MyContext } from "@utils/customTypes";
import TagRepository from "@db/tag/tag.repository";

import { msgCreateSyntaxError, msgCreateTag, msgTagSyntaxError } from "@messages/tagMessages";


export async function createHandler(ctx: MyContext) {

    const tagRepository = new TagRepository();

    // Take parameters
    const username = ctx.msg.from.username;
    const tagName = ctx.match.toString().trim().replace(/^#/, "");
    const groupId = ctx.chatId.toString();
    const userId = ctx.from.id.toString();

    // Validate parameters
    const regex = /^(?=[^A-Za-z]*[A-Za-z])[#]{0,1}[a-zA-Z0-9][a-zA-Z0-9_]{2,31}$/;
    if(tagName.length == 0)
        return await ctx.reply(msgCreateSyntaxError);
    if(!regex.test(tagName)) 
        return await ctx.reply(msgTagSyntaxError(username));

    // Check if tag already exist
    const tag = await tagRepository.get(groupId, tagName);
    if(tag !== null) {
        return await ctx.reply("⚠️ The tag #" + tagName + " already exists in this group, @" + username);
    }

    // Invoke repository
    await tagRepository.create(groupId, tagName, userId);
    return await ctx.reply(msgCreateTag(tagName, username));
}