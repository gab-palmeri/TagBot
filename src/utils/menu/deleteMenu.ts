import { Menu } from "@grammyjs/menu";
import {MyContext} from "@utils/customTypes";

import { controlPanelDescription, errorDescription } from "./descriptions";
import editGroupPermissions from "./editGroupPermissions";

const deleteMenu = new Menu<MyContext>("delete-menu")
.text(ctx => ctx.session.selectedGroup.canDelete == 1 ? "👉🏻 Everyone" : "Everyone", async (ctx) => {

    const userId = ctx.chatId.toString();

    if(ctx.session.selectedGroup.canDelete !== 1) {
        const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canDelete: 1});
        if(result) {
            ctx.session.selectedGroup.canDelete = 1;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
})  

.text(ctx => ctx.session.selectedGroup.canDelete == 0 ? "👉🏻 Only admins" : "Only admins", async (ctx) => {

    const userId = ctx.chatId.toString();

    if(ctx.session.selectedGroup.canDelete !== 0) {
        const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canDelete: 0});
        if(result) {
            ctx.session.selectedGroup.canDelete = 0;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
}).row()

.text(ctx => ctx.session.selectedGroup.canDelete == 2 ? "👉🏻 Tag creators and admins" : "Tag creators and admins", async (ctx) => {

    const userId = ctx.chatId.toString();

    if(ctx.session.selectedGroup.canDelete !== 2) {
        const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canDelete: 2});
        if(result) {
            ctx.session.selectedGroup.canDelete = 2;
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

export default deleteMenu;