import { Menu } from "@grammyjs/menu";
import {MyContext} from "utils/customTypes";

import editGroupPermissions from "../utils/editGroupPermissions";
import generateDescription from "./generateDescription";

const createMenu = new Menu<MyContext>("create-menu")
    .dynamic((ctx, range) => {

        const permissions = [{key: "only-admins", value: 0}, {key: "everyone", "value": 1}];
        for (const p of permissions) {

            const pName = p.key;
            const pValue = p.value;

            const description = ctx.t(`settings.permissions-${pName}`);
            range.text(description, async (ctx) => {
                const userId = ctx.chatId.toString();

                if(ctx.session.selectedGroup.canCreate !== pValue) {
                    const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canCreate: pValue});
                    if(result) {
                        ctx.session.selectedGroup.canCreate = pValue;
                        const description = generateDescription(ctx.t, "create", ctx.session.selectedGroup.canCreate);
                        await ctx.editMessageText(description, {parse_mode: "HTML"});
                    }
                    else {
                        return ctx.reply(ctx.t("internal-error"));
                    }
                }
            });
        }

    }).row()
    .back((ctx: MyContext) => ctx.t("settings.back"), async ctx => {
        const message = ctx.t("settings.group-panel", {groupName: ctx.session.selectedGroup.groupName });
        await ctx.editMessageText(message, {parse_mode: "HTML"});
    });

export default createMenu;