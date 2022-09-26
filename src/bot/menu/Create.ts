import { Menu } from "@grammyjs/menu";
import MyContext from "../MyContext";

import { editGroupPermissions } from "../services/adminServices";

const Create = new Menu<MyContext>("create-menu")

.text(ctx => ctx.session.selectedGroup.canCreate == 1 ? "👉🏻 Everyone" : "Everyone", async (ctx) => {
    if(ctx.session.selectedGroup.canCreate !== 1) {
        const response = await editGroupPermissions(ctx.session.selectedGroup.groupId, ctx.msg.chat.id, {canCreate: 1});
        if(response.state == "ok") {
            ctx.session.selectedGroup.canCreate = 1;
            ctx.menu.update();
        }
        else {
            return ctx.reply("An error occured. Retry later");
        }
    }
})  

.text(ctx => ctx.session.selectedGroup.canCreate == 0 ? "👉🏻 Only admins" : "Only admins", async (ctx) => {
    if(ctx.session.selectedGroup.canCreate !== 0) {
        const response = await editGroupPermissions(ctx.session.selectedGroup.groupId, ctx.msg.chat.id, {canCreate: 0});
        if(response.state == "ok") {
            ctx.session.selectedGroup.canCreate = 0;
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

export default Create;