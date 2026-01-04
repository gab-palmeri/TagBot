import { MyContext } from "@utils/customTypes";
import TagRepository from "@db/tag/tag.repository";



export async function createHandler(ctx: MyContext) {

    const tagRepository = new TagRepository();

    // Take parameters
    const tagName = ctx.match.toString().trim().replace(/^#/, "");
    const groupId = ctx.chatId.toString();
    const userId = ctx.from.id.toString();

    // Validate parameters
    const regex = /^(?=[^A-Za-z]*[A-Za-z])[#]{0,1}[a-zA-Z0-9][a-zA-Z0-9_]{2,31}$/;
    if(tagName.length == 0)
        return await ctx.reply(ctx.t("create-syntax-error"), {parse_mode: "Markdown"});
    if(!regex.test(tagName)) 
        return await ctx.reply(ctx.t("tag-syntax-error"), {parse_mode: "Markdown"});

    // Check if tag already exist
    const tag = await tagRepository.get(groupId, tagName);
    if(tag !== null) {
        return await ctx.reply(ctx.t("tag-already-exists", {tagName}), {parse_mode: "Markdown"});
    }

    // Invoke repository
    await tagRepository.create(groupId, tagName, userId);
    return await ctx.reply(ctx.t("tag-created", {tagName}), {parse_mode: "Markdown"});
}