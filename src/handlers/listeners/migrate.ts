import { MyContext } from "utils/customTypes";
import GroupRepository from "db/group/group.repository";


export async function migrateHandler(ctx: MyContext) {

    const groupRepository = new GroupRepository();

    // Take parameters
    const oldGroupId = ctx.chat.id.toString();
    const newGroupId = ctx.msg.migrate_to_chat_id.toString();

    try {
        // Invoke repository
        const group = await groupRepository.getGroup(oldGroupId);

        if (group === null) {
            return await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, ctx.t("migrate.error"));
        }

        await groupRepository.migrateGroup(oldGroupId, newGroupId);
        return await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, ctx.t("migrate.success"));
    }
    catch(e) {
        await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, ctx.t("migrate.error"));
        throw e;
    }
}