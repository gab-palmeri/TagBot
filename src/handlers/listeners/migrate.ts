import { MyContext } from "@utils/customTypes";
import GroupRepository from "@db/group/group.repository";
import { migrateSuccessMessage, migrateErrorMessage } from "@utils/messages/generalMessages";


export async function migrateHandler(ctx: MyContext) {

    const groupRepository = new GroupRepository();

    // Take parameters
    const oldGroupId = ctx.chat.id.toString();
    const newGroupId = ctx.msg.migrate_to_chat_id.toString();

    try {
        // Invoke repository
        const group = await groupRepository.getGroup(oldGroupId);

        if (group === null) {
            return await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateErrorMessage);
        }

        await groupRepository.migrateGroup(oldGroupId, newGroupId);
        return await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateSuccessMessage);
    }
    catch(e) {
        await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateErrorMessage);
        throw e;
    }
}