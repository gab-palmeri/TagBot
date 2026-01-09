import { MyContext } from "utils/customTypes";
import { ManagedMenu } from "../utils/CustomMenu";
import emptyTagsMenu from "./emptyTags";
import inactiveTagsMenu from "./inactiveTags";

const manageTags = new ManagedMenu<MyContext>("manage-tags", ctx => {
	const main = ctx.t("settings-main.header");
	const group = ctx.t("settings-group.header", {
		groupName: ctx.session.selectedGroup.groupName,
	});
	const header = ctx.t("settings-manage-tags.header");
	return `${main}\n\n${group}\n\n${header}`;
})
.submenu(ctx => ctx.t("settings-del-empty.btn"), "empty-tags-menu")
.submenu(ctx => ctx.t("settings-del-inactive.btn"), "inactive-tags-menu")
.row()
.back(ctx => ctx.t("settings-misc.back"));


manageTags.register(emptyTagsMenu);
manageTags.register(inactiveTagsMenu);

export default manageTags;
