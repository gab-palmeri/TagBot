import { MyContext } from "@utils/customTypes";
import { msgDeleteSyntaxError, msgDeleteTag } from "@utils/messages/tagMessages";
import TagServices from "features/tag/tag.services";
import TagRepository from "features/tag/tag.repository";


export async function deleteHandler(ctx: MyContext) {

    const tagService = new TagServices(new TagRepository());


    const tagName = ctx.match.toString();
    const issuerUsername = ctx.msg.from.username;
    const groupId = ctx.update.message.chat.id.toString();

    if (tagName.length == 0)
        return await ctx.reply(msgDeleteSyntaxError);

    const result = await tagService.deleteTag(groupId, tagName);

    if(result.ok === true) {
        return await ctx.reply(msgDeleteTag(tagName, issuerUsername));
    }
    else {
        switch(result.error) {
            case "NOT_FOUND":
                return await ctx.reply(`⚠️ Tag <b>#${tagName}</b> not found (@${issuerUsername})`, {parse_mode: "HTML"});
            case "INTERNAL_ERROR":
                return await ctx.reply(`⚠️ An internal error occurred while deleting the tag (@${issuerUsername})`, {parse_mode: "HTML"});
        }
    }
}