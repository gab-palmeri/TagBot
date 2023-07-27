import { Menu } from "@grammyjs/menu";
import {MyContext} from "../../customTypes";

import AdminServices from "../../services/AdminServices";

const renameMenu = new Menu<MyContext>("rename-menu")

.text(ctx => ctx.session.selectedGroup.canRename == 1 ? "👉🏻 Everyone" : "Everyone", async (ctx) => {
    if(ctx.session.selectedGroup.canRename !== 1) {
        const response = await AdminServices.editGroupPermissions(ctx.session.selectedGroup.groupId, ctx.msg.chat.id, {canRename: 1});
        if(response.state == "ok") {
            ctx.session.selectedGroup.canRename = 1;
            ctx.menu.update();
        }
        else {
            return ctx.reply("An error occured. Retry later");
        }
    }
})  

.text(ctx => ctx.session.selectedGroup.canRename == 0 ? "👉🏻 Only admins" : "Only admins", async (ctx) => {
    if(ctx.session.selectedGroup.canRename !== 0) {
        const response = await AdminServices.editGroupPermissions(ctx.session.selectedGroup.groupId, ctx.msg.chat.id, {canRename: 0});
        if(response.state == "ok") {
            ctx.session.selectedGroup.canRename = 0;
            ctx.menu.update();
        }
        else {
            return ctx.reply("An error occured. Retry later");
        }
    }
}).row()

.text(ctx => ctx.session.selectedGroup.canRename == 2 ? "👉🏻 Tag creators and admins" : "Tag creators and admins", async (ctx) => {
    if(ctx.session.selectedGroup.canRename !== 2) {
        const response = await AdminServices.editGroupPermissions(ctx.session.selectedGroup.groupId, ctx.msg.chat.id, {canRename: 2});
        if(response.state == "ok") {
            ctx.session.selectedGroup.canRename = 2;
            ctx.menu.update();
        }
        else {
            return ctx.reply("An error occured. Retry later");
        }
    }
}).row()

.back("Go Back", async ctx => {
    await ctx.editMessageText("🔑 <i><u>Select the command</u> you want to edit</i>", {parse_mode:"HTML"});
});

export default renameMenu;