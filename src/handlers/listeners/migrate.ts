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
            return await ctx.reply(ctx.t("migrate.error"));
        }

        await groupRepository.migrateGroup(oldGroupId, newGroupId);
        return await ctx.reply(ctx.t("migrate.success"));
    }
    catch(e) {
        await ctx.reply(ctx.t("migrate.error"));
        throw e;
    }
}