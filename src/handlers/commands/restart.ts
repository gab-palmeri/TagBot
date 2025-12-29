import AdminRepository from "features/admin/admin.repository";
import AdminServices from "features/admin/admin.services";
import { MyContext } from "@utils/customTypes";
import { restartSuccessMessage, restartErrorMessage } from "@utils/messages/generalMessages";


export async function restartHandler(ctx: MyContext) {

    const adminService = new AdminServices(new AdminRepository());

    const groupId = ctx.chat.id.toString();
        
    //Get the admins list from Telegram API and convert them to strings
    const adminList = await ctx.api.getChatAdministrators(ctx.chat.id);
    const adminIDs = adminList.map(admin => admin.user.id.toString());
    const result = await adminService.reloadAdmins(groupId, adminIDs);

    if(result.ok === true) {
        return await ctx.reply(restartSuccessMessage);
    }
    else {
        switch(result.error) {
            case "INTERNAL_ERROR":
                return await ctx.reply(restartErrorMessage);
        }
    }
}