import { Menu } from "@grammyjs/menu";
import {MyContext} from "../../customTypes";

import AdminServices from "../../services/AdminServices";
import { controlPanelDescription, errorDescription } from "./descriptions";

const createMenu = new Menu<MyContext>("create-menu")

.text(ctx => ctx.session.selectedGroup.canCreate == 1 ? "👉🏻 Everyone" : "Everyone", async (ctx) => {
    if(ctx.session.selectedGroup.canCreate !== 1) {
        const response = await AdminServices.editGroupPermissions(ctx.session.selectedGroup.groupId, ctx.msg.chat.id, {canCreate: 1});
        if(response.state == "ok") {
            ctx.session.selectedGroup.canCreate = 1;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
})  

.text(ctx => ctx.session.selectedGroup.canCreate == 0 ? "👉🏻 Only admins" : "Only admins", async (ctx) => {
    if(ctx.session.selectedGroup.canCreate !== 0) {
        const response = await AdminServices.editGroupPermissions(ctx.session.selectedGroup.groupId, ctx.msg.chat.id, {canCreate: 0});
        if(response.state == "ok") {
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