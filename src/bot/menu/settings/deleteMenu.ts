import { Menu } from "@grammyjs/menu";
import {MyContext} from "../../customTypes";

import AdminServices from "../../services/AdminServices";

import { controlPanelDescription, errorDescription } from "./descriptions";


const deleteMenu = new Menu<MyContext>("delete-menu")

.text(ctx => ctx.session.selectedGroup.canDelete == 1 ? "👉🏻 Everyone" : "Everyone", async (ctx) => {
    if(ctx.session.selectedGroup.canDelete !== 1) {
        const response = await AdminServices.editGroupPermissions(ctx.session.selectedGroup.groupId, ctx.msg.chat.id, {canDelete: 1});
        if(response.state == "ok") {
            ctx.session.selectedGroup.canDelete = 1;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
})  

.text(ctx => ctx.session.selectedGroup.canDelete == 0 ? "👉🏻 Only admins" : "Only admins", async (ctx) => {
    if(ctx.session.selectedGroup.canDelete !== 0) {
        const response = await AdminServices.editGroupPermissions(ctx.session.selectedGroup.groupId, ctx.msg.chat.id, {canDelete: 0});
        if(response.state == "ok") {
            ctx.session.selectedGroup.canDelete = 0;
            ctx.menu.update();
        }
        else {
            return ctx.reply(errorDescription);
        }
    }
}).row()

.text(ctx => ctx.session.selectedGroup.canDelete == 2 ? "👉🏻 Tag creators and admins" : "Tag creators and admins", async (ctx) => {
    if(ctx.session.selectedGroup.canDelete !== 2) {
        const response = await AdminServices.editGroupPermissions(ctx.session.selectedGroup.groupId, ctx.msg.chat.id, {canDelete: 2});
        if(response.state == "ok") {
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