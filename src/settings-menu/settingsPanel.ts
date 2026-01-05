import { Menu } from "@grammyjs/menu";

import { MyContext } from 'utils/customTypes';

import controlPanel from  "./groupPanel";

//Menu that shows all the groups
const settingsPanel = new Menu<MyContext>("groups-list")
    .dynamic((ctx, range) => {
        for (const group of ctx.session.groups) {
            range.submenu(group.groupName, "control-panel", async ctx => {
                    ctx.session.selectedGroup = group;
                    const description = ctx.t("settings.group-panel", {groupName: ctx.session.selectedGroup.groupName });
                    await ctx.editMessageText(description, {parse_mode:"Markdown"});
                }).row();
        }
    })
    .text((ctx: MyContext) => ctx.t("settings.close"), (ctx) => ctx.deleteMessage());

settingsPanel.register(controlPanel);


export default settingsPanel;