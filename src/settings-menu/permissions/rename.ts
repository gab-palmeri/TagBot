import { MyContext } from "utils/customTypes";
import { ManagedMenu } from "../utils/CustomMenu";

import permissions from "./permissions";
import editGroupPermissions from "../../utils/editGroupPermissions";

/* ---------- RENAME MENU ---------- */
const renameMenu = new ManagedMenu<MyContext>(
    "rename-menu",
    (ctx) => {
        const main = ctx.t("settings-main.header");
        const group = ctx.t("settings-group.header", { groupName: ctx.session.selectedGroup.groupName });
        const renameHeader = ctx.t("settings-rename.header");
        const renameDesc = ctx.t("settings-rename.description");

        const perm = permissions.find((p) => p.value === ctx.session.selectedGroup.canRename).key;
        const currentSetting = ctx.t("settings-current", { current: ctx.t(`settings-permissions.${perm}`) });

        return `${main}\n\n${group}\n\n${renameHeader}\n\n${renameDesc}\n${currentSetting}`; 
    }
);

renameMenu.dynamic((ctx, range) => {

    for (const [i, p] of permissions.entries()) {
        range.text(ctx.t(`settings-permissions.${p.key}`), async (ctx) => {
            const userId = ctx.chatId.toString();
            const { groupId, canRename } = ctx.session.selectedGroup;

            if (canRename !== p.value) {
                const result = await editGroupPermissions(groupId, userId, { canRename: p.value });
                if (result) {
                    ctx.session.selectedGroup.canRename = p.value;
                    await renameMenu.renderTitle(ctx);
                } else {
                    await ctx.answerCallbackQuery(ctx.t("internal-error"));
                }
            }
        });
        if (i === 1) range.row();
    }
}).row().back((ctx) => ctx.t("settings-misc.back"));

export default renameMenu;