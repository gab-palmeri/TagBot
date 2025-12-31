import AdminRepository from "@db/admin/admin.repository";
import { MyContext } from "@utils/customTypes";
import { restartSuccessMessage, restartErrorMessage } from "@utils/messages/generalMessages";


export async function restartHandler(ctx: MyContext) {

    const adminRepository = new AdminRepository();

    // Take parameters
    const groupId = ctx.chatId.toString();
    const adminList = await ctx.api.getChatAdministrators(ctx.chat.id);
    const adminIDs = adminList.map(admin => admin.user.id.toString());

    // Invoke repository
    const deleteResult = await adminRepository.deleteAllAdmins(groupId);
    if(deleteResult.ok === false) {
        return await ctx.reply(restartErrorMessage);
    }

    // Invoke repository
    const addResult = await adminRepository.addAdmins(groupId, adminIDs);
    if(addResult.ok === false) {
        return await ctx.reply(restartErrorMessage);
    }

    return await ctx.reply(restartSuccessMessage);
}