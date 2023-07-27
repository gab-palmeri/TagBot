import { Menu } from "@grammyjs/menu";

import { MyContext } from '../../customTypes';

import controlPanel from  "./controlPanel";


//Menu that shows all the groups
const groupsMenu = new Menu<MyContext>("groups-list");

groupsMenu.dynamic((ctx, range) => {
    for (const group of ctx.session.groups) {
        range 
            .submenu(group.groupName, "control-panel", async ctx => {
                ctx.session.selectedGroup = group;
                await ctx.editMessageText("🔑 <b>Group:</b> " + group.groupName + "\n<i><u>Select the command</u> you want to edit</i>", {parse_mode:"HTML"});
            }).row();
    }
})
.text("Close", (ctx) => ctx.deleteMessage());

groupsMenu.register(controlPanel);


export default groupsMenu;