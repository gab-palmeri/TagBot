import { MyContext } from "utils/customTypes";
import TagRepository from "db/tag/tag.repository";
import GroupRepository from "db/group/group.repository";



export async function createHandler(ctx: MyContext) {

    const tagRepository = new TagRepository();
    const groupRepository = new GroupRepository();


    // Take parameters
    const tagName = ctx.match.toString().trim().replace(/^#/, "");
    const groupId = ctx.chatId.toString();
    const userId = ctx.from.id.toString();

    // Validate parameters
    const regex = /^(?=[^A-Za-z]*[A-Za-z])[#]{0,1}[a-zA-Z0-9][a-zA-Z0-9_]{2,31}$/;
    if(tagName.length == 0)
        return await ctx.reply(ctx.t("tag.create-syntax"), {parse_mode: "HTML"});
    if(!regex.test(tagName)) 
        return await ctx.reply(ctx.t("tag.validation-syntax"), {parse_mode: "HTML"});

    // Get group
    const group = await groupRepository.getGroup(groupId);


    // Check if tag already exist
    const tag = await tagRepository.get(group.id, tagName);
    if(tag !== null) {
        return await ctx.reply(ctx.t("tag.validation-already-exists", {tagName}), {parse_mode: "HTML"});
    }

    // Invoke repository
    await tagRepository.create(group.id, tagName, userId);
    return await ctx.reply(ctx.t("tag.create-ok", {tagName}), {parse_mode: "HTML"});
}