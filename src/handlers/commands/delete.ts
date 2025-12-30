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

    // Invoke repository
    const result = await tagRepository.delete(groupId, tagName);

    // Handle response
    if(result.ok === true) {
        return await ctx.reply(msgDeleteTag(tagName, username));
    }
    else {
        switch(result.error) {
            case "NOT_FOUND":
                return await ctx.reply(`⚠️ Tag <b>#${tagName}</b> not found (@${username})`, {parse_mode: "HTML"});
            case "DB_ERROR":
                return await ctx.reply(`⚠️ An internal error occurred while deleting the tag (@${username})`, {parse_mode: "HTML"});
        }
    }
}