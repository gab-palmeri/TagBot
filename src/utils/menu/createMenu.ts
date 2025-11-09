import { Menu } from "@grammyjs/menu";
import {MyContext} from "@utils/customTypes";

import AdminServices from "../../features/admin/admin.services";
import { controlPanelDescription, errorDescription } from "./descriptions";
import { GroupDTO } from "features/group/group.dto";
import AdminRepository from "features/admin/admin.repository";

const adminService = new AdminServices(new AdminRepository());

const createMenu = new Menu<MyContext>("create-menu")
.text(ctx => ctx.session.selectedGroup.canCreate == 1 ? "👉🏻 Everyone" : "Everyone", async (ctx) => {

    const groupId = ctx.msg.chat.id.toString();

    if(ctx.session.selectedGroup.canCreate !== 1) {
        const result = await adminService.editGroupPermissions(ctx.session.selectedGroup.groupId, groupId, {canCreate: 1});
        if(result instanceof GroupDTO) {
            ctx.session.selectedGroup.canCreate = 1;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
})  

.text(ctx => ctx.session.selectedGroup.canCreate == 0 ? "👉🏻 Only admins" : "Only admins", async (ctx) => {

    const groupId = ctx.msg.chat.id.toString();

    if(ctx.session.selectedGroup.canCreate !== 0) {
        const result = await adminService.editGroupPermissions(ctx.session.selectedGroup.groupId, groupId, {canCreate: 0});
        if(result instanceof GroupDTO) {
            ctx.session.selectedGroup.canCreate = 0;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
}).row()

.back("Go Back", async ctx => {
    await ctx.editMessageText(controlPanelDescription(ctx.session.selectedGroup.groupName), {parse_mode:"HTML"});
});

export default createMenu;