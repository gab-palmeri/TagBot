import { MyContext } from "@utils/customTypes";
import { msgDeleteSyntaxError, msgDeleteTag } from "@utils/messages/tagMessages";
import TagRepository from "@db/tag/tag.repository";


export async function deleteHandler(ctx: MyContext) {

    const tagRepository = new TagRepository();

    // Take parameters
    const tagName = ctx.match.toString();
    const username = ctx.from.username;
    const groupId = ctx.chatId.toString();

    // Validate parameters
    if (tagName.length == 0)
        return await ctx.reply(msgDeleteSyntaxError);

    // Check if tag exists
    const tag = await tagRepository.get(groupId, tagName);

    if (tag === null) {
        return await ctx.reply("⚠️ The tag #" + tagName + " does not exist in this group, @" + username);
    }

    // Delete tag
    await tagRepository.delete(groupId, tagName);
    return await ctx.reply(msgDeleteTag(tagName, username));
}