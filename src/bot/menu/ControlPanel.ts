import { Menu } from "@grammyjs/menu";

import MyContext from '../MyContext';

import Create from './Create';
import Delete from './Delete';
import Rename from './Rename';
import AddUsers from "./AddUsers";
import RemUsers from "./RemUsers";

const menu = new Menu<MyContext>("groups-list");

menu.dynamic((ctx, range) => {
    for (const group of ctx.session.groups) {
        range 
            .submenu(group.groupName, "control-panel", async ctx => {
                ctx.session.selectedGroup = group;
                await ctx.editMessageText("🔑 <b>Group:</b> " + group.groupName + "\n<i><u>Select the command</u> you want to edit</i>", {parse_mode:"HTML"});
            }).row();
    }
})
.text("Close", (ctx) => ctx.deleteMessage());


const ControlPanel = new Menu<MyContext>("control-panel")
    .submenu("✏️ Create", "create-menu", ctx => ctx.editMessageText("Who can create tags?"))
    .submenu("💣 Delete", "delete-menu", ctx => ctx.editMessageText("Who can delete tags?")).row()
    .submenu("📝 Add Users", "addusers-menu", ctx => ctx.editMessageText("Who can add users to tags?"))
    .submenu("🗑 Remove Users", "remusers-menu", ctx => ctx.editMessageText("Who can remove users from tags?")).row()
    .submenu("✍️ Rename", "rename-menu", ctx => ctx.editMessageText("Who can rename tags?"))
    .back("Back", ctx => ctx.editMessageText("<b>TagBot Control Panel</b>\n\n👉🏻  <i><u>Select the group</u> you want to edit.</i>", {parse_mode:"HTML"})).row();

menu.register(ControlPanel);
ControlPanel.register(Create);
ControlPanel.register(Delete);
ControlPanel.register(Rename);
ControlPanel.register(AddUsers);
ControlPanel.register(RemUsers);

export default menu;