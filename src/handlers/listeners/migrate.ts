import { MyContext } from "@utils/customTypes";
import GroupServices from "features/group/group.services";
import GroupRepository from "features/group/group.repository";
import { migrateSuccessMessage, migrateErrorMessage } from "@utils/messages/generalMessages";


export async function migrateHandler(ctx: MyContext) {

    const groupService = new GroupServices(new GroupRepository());

    const oldGroupId = ctx.chat.id.toString();
    const newGroupId = ctx.msg.migrate_to_chat_id.toString();

    const response = await groupService.migrateGroup(oldGroupId, newGroupId);

    if(response.ok === true) {
        await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateSuccessMessage);
        return;
    }
    else {
        switch(response.error) {
            case "NOT_FOUND":
                return await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateErrorMessage);
            case "INTERNAL_ERROR":
                return await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateErrorMessage);
        }
    } 
}