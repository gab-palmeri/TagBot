import { MyContext } from 'utils/customTypes';
import { ManagedMenu } from "./utils/CustomMenu";

import createMenu from "./permissions/create";
import deleteMenu from "./permissions/delete";
import renameMenu from "./permissions/rename";
import languageMenuGroup from "./language/languageGroup";
import manageTags from "./unusedTags/unusedTags";

// Group control panel
const groupPanel = new ManagedMenu<MyContext>(
    "group-panel",
    ctx => {
        const group = ctx.session.selectedGroup;
        const header = ctx.t("settings-main.header");
        const groupHeader = ctx.t("settings-group.header", {groupName: group.groupName});
        const description = ctx.t("settings-group.description");
        const message = `${header}\n\n${groupHeader}\n\n${description}`;
        return message;
    }
);


groupPanel
    .text("🛡️ Permissions 🛡️").row()
    .submenu(
        (ctx) => ctx.t("settings-create.btn"), 
        "create-menu"
    )
    .submenu(
        (ctx) => ctx.t("settings-delete.btn"), 
        "delete-menu"
    )
    .submenu(
        (ctx) => ctx.t("settings-rename.btn"), 
        "rename-menu"
    )
    .row()
    .submenu(
        (ctx) => ctx.t("settings-language.btn"), 
        "language-menu-group"
    )
    .submenu(
        (ctx) => ctx.t("settings-manage-tags.btn"), 
        "manage-tags"
    )
    .row()
    .back((ctx) => ctx.t("settings-misc.back"));

groupPanel.register([
    createMenu,
    deleteMenu,
    renameMenu,
    manageTags,
    languageMenuGroup
]);

export default groupPanel;