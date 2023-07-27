import { Menu } from "@grammyjs/menu";

import { MyContext } from '../../customTypes';

import Create from "./createMenu";
import Delete from "./deleteMenu";
import Rename from "./renameMenu";

import { groupsMenuDescription, createDescription, renameDescription, deleteDescription } from "./descriptions";

//Control Panel Menu for a single group
const controlPanel = new Menu<MyContext>("control-panel")
    .submenu("✏️ Create", "create-menu", ctx => ctx.editMessageText(createDescription))
    .submenu("💣 Delete", "delete-menu", ctx => ctx.editMessageText(deleteDescription)).row()
    .submenu("✍️ Rename", "rename-menu", ctx => ctx.editMessageText(renameDescription))
    .back("Back", ctx => ctx.editMessageText(groupsMenuDescription, {parse_mode:"HTML"})).row();

controlPanel.register(Create);
controlPanel.register(Delete);
controlPanel.register(Rename);

export default controlPanel;