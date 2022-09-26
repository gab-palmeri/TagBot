import { Menu } from "@grammyjs/menu";
import { Context, SessionFlavor } from "grammy";

import MyContext from './MyContext';

const menu = new Menu<MyContext>("groups-list");

menu.dynamic((ctx, range) => {

    for (const group of ctx.session.groups) {
        range 
            .submenu(group.groupName, "control-panel", ctx => ctx.editMessageText("🔑 <i><u>Select the command</u> you want to edit</i>", {parse_mode:"HTML"}))
            .row();
    }
})
.text("Close", (ctx) => ctx.deleteMessage());


const ControlPanel = new Menu<MyContext>("control-panel")
    .submenu("✏️ Create", "create-menu", ctx => ctx.editMessageText("Who can create tags?"))
    .submenu("💣 Delete", "delete-menu", ctx => ctx.editMessageText("Who can delete tags?")).row()
    .submenu("📝 Addusers", "addusers-menu", ctx => ctx.editMessageText("Who can add users to tags?"))
    .submenu("🗑 Remusers", "remusers-menu", ctx => ctx.editMessageText("Who can remove users from tags?")).row()
    .submenu("✍️ Rename", "rename-menu", ctx => ctx.editMessageText("Who can rename tags?"))
    .back("Back", ctx => ctx.editMessageText("<b>TagBot Control Panel</b>\n\n👉🏻  <i><u>Select the group</u> you want to edit.</i>", {parse_mode:"HTML"})).row();
    

const Create = new Menu<MyContext>("create-menu")
    .text("👉🏻 Everyone", (ctx) => ctx.reply("Powered by grammY"))
    .text("Only admins", (ctx) => ctx.reply("Powered by grammY")).row()
    .back("Go Back", ctx => ctx.editMessageText("🔑 <i><u>Select the command</u> you want to edit</i>", {parse_mode:"HTML"}));

const Delete = new Menu<MyContext>("delete-menu")
    .text("Everyone", (ctx) => ctx.reply("Powered by grammY"))
    .text("👉🏻 Only admins", (ctx) => ctx.reply("Powered by grammY")).row()
    .back("Go Back", ctx => ctx.editMessageText("🔑 <i><u>Select the command</u> you want to edit</i>", {parse_mode:"HTML"}));

const Rename = new Menu<MyContext>("rename-menu")
    .text("👉🏻 Everyone", (ctx) => ctx.reply("Powered by grammY"))
    .text("Only admins", (ctx) => ctx.reply("Powered by grammY")).row()
    .text("Tag creators and admins", (ctx) => ctx.reply("Powered by grammY")).row()
    .back("Go Back", ctx => ctx.editMessageText("🔑 <i><u>Select the command</u> you want to edit</i>", {parse_mode:"HTML"}));

const Addusers = new Menu<MyContext>("addusers-menu")
    .text("👉🏻 Everyone", (ctx) => ctx.reply("Powered by grammY"))
    .text("Only admins", (ctx) => ctx.reply("Powered by grammY")).row()
    .text("Tag creators and admins", (ctx) => ctx.reply("Powered by grammY")).row()
    .back("Go Back", ctx => ctx.editMessageText("🔑 <i><u>Select the command</u> you want to edit</i>", {parse_mode:"HTML"}));

const Remusers = new Menu<MyContext>("remusers-menu")
    .text("👉🏻 Everyone", (ctx) => ctx.reply("Powered by grammY"))
    .text("Only admins", (ctx) => ctx.reply("Powered by grammY")).row()
    .text("Tag creators and admins", (ctx) => ctx.reply("Powered by grammY")).row()
    .back("Go Back", ctx => ctx.editMessageText("🔑 <i><u>Select the command</u> you want to edit</i>", {parse_mode:"HTML"}));

menu.register(ControlPanel);
ControlPanel.register(Create);
ControlPanel.register(Delete);
ControlPanel.register(Rename);
ControlPanel.register(Addusers);
ControlPanel.register(Remusers);

export default menu;