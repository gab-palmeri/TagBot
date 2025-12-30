import { Menu } from "@grammyjs/menu";
import {MyContext} from "@utils/customTypes";

import editGroupPermissions from "./editGroupPermissions";
import { controlPanelDescription, errorDescription } from "./descriptions";

const createMenu = new Menu<MyContext>("create-menu")
.text(ctx => ctx.session.selectedGroup.canCreate == 1 ? "👉🏻 Everyone" : "Everyone", async (ctx) => {

    const userId = ctx.chatId.toString();

    if(ctx.session.selectedGroup.canCreate !== 1) {
        const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canCreate: 1});
        if(result.ok === true) {
            ctx.session.selectedGroup.canCreate = 1;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
})  

.text(ctx => ctx.session.selectedGroup.canCreate == 0 ? "👉🏻 Only admins" : "Only admins", async (ctx) => {

    const userId = ctx.chatId.toString();

    if(ctx.session.selectedGroup.canCreate !== 0) {
        const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canCreate: 0});
        if(result.ok === true) {
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