import { MyContext } from "@utils/customTypes";
import GroupRepository from "@db/group/group.repository";
import { migrateSuccessMessage, migrateErrorMessage } from "@utils/messages/generalMessages";


export async function migrateHandler(ctx: MyContext) {

    const groupRepository = new GroupRepository();

    // Take parameters
    const oldGroupId = ctx.chat.id.toString();
    const newGroupId = ctx.msg.migrate_to_chat_id.toString();

    // Invoke service
    const response = await groupRepository.migrateGroup(oldGroupId, newGroupId);

    // Handle response
    if(response.ok === true) {
        await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateSuccessMessage);
        return;
    }
    else {
        switch(response.error) {
            case "NOT_FOUND":
                return await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateErrorMessage);
            case "DB_ERROR":
                return await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateErrorMessage);
        }
    } 
}