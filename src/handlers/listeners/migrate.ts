import { MyContext } from "utils/customTypes";
import GroupRepository from "db/group/group.repository";


export async function migrateHandler(ctx: MyContext) {

    const groupRepository = new GroupRepository();

    // Take parameters
    const oldGroupId = ctx.msg.migrate_from_chat_id.toString();
    const newGroupId = ctx.chat.id.toString();

    try {
        // Invoke repository
        const group = await groupRepository.getGroup(oldGroupId);

        if (group === null) {
            return await ctx.reply(ctx.t("migrate.error"), {parse_mode: "HTML"});
        }

        await groupRepository.migrateGroup(oldGroupId, newGroupId);
        await ctx.api.editMessageText(ctx.chatId, ctx.session.botJoinedMessageId, ctx.t("migrate.success"), {parse_mode: "HTML"});
    }
    catch(e) {
        await ctx.reply(ctx.t("migrate.error"), {parse_mode: "HTML"});
        throw e;
    }
}