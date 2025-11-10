import { Menu } from "@grammyjs/menu";
import {MyContext} from "@utils/customTypes";

import AdminServices from "features/admin/admin.services";
import AdminRepository from "features/admin/admin.repository";

import { controlPanelDescription, errorDescription } from "./descriptions";

const adminService = new AdminServices(new AdminRepository());

const deleteMenu = new Menu<MyContext>("delete-menu")
.text(ctx => ctx.session.selectedGroup.canDelete == 1 ? "👉🏻 Everyone" : "Everyone", async (ctx) => {

    const groupId = ctx.msg.chat.id.toString();

    if(ctx.session.selectedGroup.canDelete !== 1) {
        const result = await adminService.editGroupPermissions(ctx.session.selectedGroup.groupId, groupId, {canDelete: 1});
        if(result.ok === true) {
            ctx.session.selectedGroup.canDelete = 1;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
})  

.text(ctx => ctx.session.selectedGroup.canDelete == 0 ? "👉🏻 Only admins" : "Only admins", async (ctx) => {

    const groupId = ctx.msg.chat.id.toString();

    if(ctx.session.selectedGroup.canDelete !== 0) {
        const result = await adminService.editGroupPermissions(ctx.session.selectedGroup.groupId, groupId, {canDelete: 0});
        if(result.ok === true) {
            ctx.session.selectedGroup.canDelete = 0;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
}).row()

.text(ctx => ctx.session.selectedGroup.canDelete == 2 ? "👉🏻 Tag creators and admins" : "Tag creators and admins", async (ctx) => {

    const groupId = ctx.msg.chat.id.toString();

    if(ctx.session.selectedGroup.canDelete !== 2) {
        const result = await adminService.editGroupPermissions(ctx.session.selectedGroup.groupId, groupId, {canDelete: 2});
        if(result.ok === true) {
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