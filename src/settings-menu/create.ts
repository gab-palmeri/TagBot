import { Menu } from "@grammyjs/menu";
import {MyContext} from "utils/customTypes";

import editGroupPermissions from "./editGroupPermissions";
import generateDescription from "./generateDescription";

const createMenu = new Menu<MyContext>("create-menu")
    .text(ctx => ctx.t("settings.permissions-only-admins"), async (ctx) => {
        const userId = ctx.chatId.toString();

        if(ctx.session.selectedGroup.canCreate !== 0) {
            const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canCreate: 0});
            if(result) {
                ctx.session.selectedGroup.canCreate = 0;
                const description = generateDescription(ctx.t, "create", ctx.session.selectedGroup.canCreate);
                await ctx.editMessageText(description, {parse_mode: "HTML"});
            }
            else {
                return ctx.reply(ctx.t("internal-error"));
            }
        }
    })
    .text(ctx => ctx.t("settings.permissions-everyone"), async (ctx) => {

        const userId = ctx.chatId.toString();

        if(ctx.session.selectedGroup.canCreate !== 1) {
            const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canCreate: 1});

            if(result) {
                ctx.session.selectedGroup.canCreate = 1;
                const description = generateDescription(ctx.t, "create", ctx.session.selectedGroup.canCreate);
                await ctx.editMessageText(description, {parse_mode: "HTML"});
            }
            else {
                return ctx.reply(ctx.t("internal-error"));
            }
        }
    }).row()
    .back((ctx: MyContext) => ctx.t("settings.back"), async ctx => {
        const message = ctx.t("settings.group-panel", {groupName: ctx.session.selectedGroup.groupName });
        await ctx.editMessageText(message, {parse_mode: "HTML"});
    });

export default createMenu;