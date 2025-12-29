import { MyContext } from "@utils/customTypes";
import TagServices from "features/tag/tag.services";
import TagRepository from "features/tag/tag.repository";
import { msgCreateSyntaxError, msgCreateTag, msgTagSyntaxError } from "@messages/tagMessages";


export async function createHandler(ctx: MyContext) {

    const tagService = new TagServices(new TagRepository());

    const issuerUsername = ctx.msg.from.username;
    const args = ctx.match.toString();

    const groupId = ctx.msg.chat.id.toString();
    const userId = ctx.msg.from.id.toString();

    const tagName = args.trim();
    if(tagName.length == 0)
        return await ctx.reply(msgCreateSyntaxError);
    
        
    const result = await tagService.createTag(groupId, tagName, userId);

    if(result.ok === true) {
        return await ctx.reply(msgCreateTag(tagName, issuerUsername));
    }
    else {
        switch(result.error) {
            case "INVALID_SYNTAX":
                return await ctx.reply(msgTagSyntaxError(issuerUsername));
            case "ALREADY_EXISTS":
                return await ctx.reply(`⚠️ Tag <b>#${tagName}</b> already exists (@${issuerUsername})`, {parse_mode: "HTML"});
            case "INTERNAL_ERROR":
                return await ctx.reply(`⚠️ An internal error occurred while creating the tag (@${issuerUsername})`, {parse_mode: "HTML"});
        }
    }
}