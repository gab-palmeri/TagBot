import { MyContext } from "@utils/customTypes";
import TagRepository from "@db/tag/tag.repository";
import GroupRepository from "@db/group/group.repository";


export async function deleteHandler(ctx: MyContext) {

    const tagRepository = new TagRepository();
    const groupRepository = new GroupRepository();


    // Take parameters
    const tagName = ctx.match.toString();
    const groupId = ctx.chatId.toString();

    // Validate parameters
    if (tagName.length == 0)
        return await ctx.reply(ctx.t("tag.delete-syntax"), {parse_mode: "Markdown"});

    // Get group
    const group = await groupRepository.getGroup(groupId);


    // Check if tag exists
    const tag = await tagRepository.get(group.id, tagName);

    if (tag === null) {
        return await ctx.reply(ctx.t("tag.validation-not-found", { tagName }), {parse_mode: "Markdown"});
    }

    // Delete tag
    await tagRepository.delete(group.id, tagName);
    return await ctx.reply(ctx.t("tag.delete-ok", { tagName }), {parse_mode: "Markdown"});
}