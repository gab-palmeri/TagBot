import { MyContext } from "utils/customTypes";
import { ManagedMenu } from "../utils/CustomMenu";

import permissions from "./permissions";
import editGroupPermissions from "../../utils/editGroupPermissions";

/* ---------- DELETE MENU ---------- */
const deleteMenu = new ManagedMenu<MyContext>(
    "delete-menu",
    (ctx) => {
        const main = ctx.t("settings-main.header");
        const group = ctx.t("settings-group.header", { groupName: ctx.session.selectedGroup.groupName });
        const deleteHeader = ctx.t("settings-delete.header");
        const deleteDesc = ctx.t("settings-delete.description");

        const perm = permissions.find((p) => p.value === ctx.session.selectedGroup.canDelete).key;
        const currentSetting = ctx.t("settings-current", { current: ctx.t(`settings-permissions.${perm}`) });

        return `${main}\n\n${group}\n\n${deleteHeader}\n\n${deleteDesc}\n${currentSetting}`; 
    }
);

deleteMenu.dynamic((ctx, range) => {
    const permissions = [
        { key: "only-admins", value: 0 },
        { key: "everyone", value: 1 },
        { key: "admins-creators", value: 2 },
    ];

    for (const [i, option] of permissions.entries()) {
        range.text(ctx.t(`settings-permissions.${option.key}`), async (ctx) => {
            const userId = ctx.chatId.toString();
            const { groupId, canDelete } = ctx.session.selectedGroup;

            if (canDelete !== option.value) {
                const result = await editGroupPermissions(groupId, userId, { canDelete: option.value });
                if (result) {
                    ctx.session.selectedGroup.canDelete = option.value;
                    await deleteMenu.renderTitle(ctx);
                } else {
                    await ctx.answerCallbackQuery(ctx.t("internal-error"));
                }
            }
        });
        if (i === 1) range.row();
    }
}).row().back((ctx) => ctx.t("settings-misc.back"));

export default deleteMenu;