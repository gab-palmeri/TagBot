import { Menu } from "@grammyjs/menu";
import {MyContext} from "@utils/customTypes";

import { controlPanelDescription, errorDescription } from "./descriptions";
import editGroupPermissions from "./editGroupPermissions";

const renameMenu = new Menu<MyContext>("rename-menu")
.text(ctx => ctx.session.selectedGroup.canRename == 1 ? "👉🏻 Everyone" : "Everyone", async (ctx) => {

    const userId = ctx.chatId.toString();

    if(ctx.session.selectedGroup.canRename !== 1) {
        const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canRename: 1});
        if(result) {
            ctx.session.selectedGroup.canRename = 1;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
})  

.text(ctx => ctx.session.selectedGroup.canRename == 0 ? "👉🏻 Only admins" : "Only admins", async (ctx) => {

    const userId = ctx.chatId.toString();

    if(ctx.session.selectedGroup.canRename !== 0) {
        const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canRename: 0});
        if(result) {
            ctx.session.selectedGroup.canRename = 0;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
}).row()

.text(ctx => ctx.session.selectedGroup.canRename == 2 ? "👉🏻 Tag creators and admins" : "Tag creators and admins", async (ctx) => {

    const userId = ctx.chatId.toString();

    if(ctx.session.selectedGroup.canRename !== 2) {
        const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canRename: 2});
        if(result) {
            ctx.session.selectedGroup.canRename = 2;
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

export default renameMenu;