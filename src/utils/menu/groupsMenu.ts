import { Menu } from "@grammyjs/menu";

import { MyContext } from '@utils/customTypes';

import controlPanel from  "./controlPanel";
import { controlPanelDescription } from "./descriptions";

//Menu that shows all the groups
const groupsMenu = new Menu<MyContext>("groups-list");

groupsMenu.dynamic((ctx, range) => {
    for (const group of ctx.session.groups) {
        range.submenu(group.groupName, "control-panel", async ctx => {
                ctx.session.selectedGroup = group;
                await ctx.editMessageText(controlPanelDescription(ctx.session.selectedGroup.groupName), {parse_mode:"HTML"});
            }).row();
    }
})
.text("Close", (ctx) => ctx.deleteMessage());

groupsMenu.register(controlPanel);


export default groupsMenu;