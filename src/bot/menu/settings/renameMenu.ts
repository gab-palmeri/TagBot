import { Menu } from "@grammyjs/menu";
import {MyContext} from "../../customTypes";

import AdminServices from "../../services/AdminServices";

import { controlPanelDescription, errorDescription } from "./descriptions";

const renameMenu = new Menu<MyContext>("rename-menu")

.text(ctx => ctx.session.selectedGroup.canRename == 1 ? "👉🏻 Everyone" : "Everyone", async (ctx) => {

    const groupId = ctx.msg.chat.id.toString();

    if(ctx.session.selectedGroup.canRename !== 1) {
        const result = await AdminServices.editGroupPermissions(ctx.session.selectedGroup.groupId, groupId, {canRename: 1});
        if(result.isSuccess()) {
            ctx.session.selectedGroup.canRename = 1;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
})  

.text(ctx => ctx.session.selectedGroup.canRename == 0 ? "👉🏻 Only admins" : "Only admins", async (ctx) => {

    const groupId = ctx.msg.chat.id.toString();

    if(ctx.session.selectedGroup.canRename !== 0) {
        const result = await AdminServices.editGroupPermissions(ctx.session.selectedGroup.groupId, groupId, {canRename: 0});
        if(result.isSuccess()) {
            ctx.session.selectedGroup.canRename = 0;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
}).row()

.text(ctx => ctx.session.selectedGroup.canRename == 2 ? "👉🏻 Tag creators and admins" : "Tag creators and admins", async (ctx) => {

    const groupId = ctx.msg.chat.id.toString();

    if(ctx.session.selectedGroup.canRename !== 2) {
        const result = await AdminServices.editGroupPermissions(ctx.session.selectedGroup.groupId, groupId, {canRename: 2});
        if(result.isSuccess()) {
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