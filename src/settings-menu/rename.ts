import { Menu } from "@grammyjs/menu";
import {MyContext} from "utils/customTypes";

import editGroupPermissions from "./editGroupPermissions";
import generateDescription from "./generateDescription";

const renameMenu = new Menu<MyContext>("rename-menu")
    .text(ctx => ctx.t("settings.permissions-only-admins"), async (ctx) => {
        const userId = ctx.chatId.toString();

        if(ctx.session.selectedGroup.canRename !== 0) {
            const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canRename: 0});
            if(result) {
                ctx.session.selectedGroup.canRename = 0;
                const description = generateDescription(ctx.t, "rename", ctx.session.selectedGroup.canRename);
                await ctx.editMessageText(description, {parse_mode:"Markdown"});
            }
            else {
                return ctx.reply(ctx.t("internal-error"));
            }
        }
    })
    .text(ctx => ctx.t("settings.permissions-everyone"), async (ctx) => {

        const userId = ctx.chatId.toString();

        if(ctx.session.selectedGroup.canRename !== 1) {
            const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canRename: 1});
            if(result) {
                ctx.session.selectedGroup.canRename = 1;
                const description = generateDescription(ctx.t, "rename", ctx.session.selectedGroup.canRename);
                await ctx.editMessageText(description, {parse_mode:"Markdown"});
            }
            else {
                return ctx.reply(ctx.t("internal-error"));
            }
        }
    }).row()
    .text(ctx => ctx.t("settings.permissions-admins-creators"), async (ctx) => {

        const userId = ctx.chatId.toString();

        if(ctx.session.selectedGroup.canRename !== 2) {
            const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canRename: 2});
            if(result) {
                ctx.session.selectedGroup.canRename = 2;
                const description = generateDescription(ctx.t, "rename", ctx.session.selectedGroup.canRename);
                await ctx.editMessageText(description, {parse_mode:"Markdown"});
            }
            else {
                return ctx.reply(ctx.t("internal-error"));
            }
        }
    }).row()

    .back((ctx: MyContext) => ctx.t("settings.back"), async ctx => {
        const message = ctx.t("settings.group-panel", {groupName: ctx.session.selectedGroup.groupName });
        await ctx.editMessageText(message, {parse_mode:"Markdown"});
    });

export default renameMenu;