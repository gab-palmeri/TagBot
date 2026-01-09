import { MyContext } from "utils/customTypes";
import { ManagedMenu } from "../utils/CustomMenu";
import withConfirm from "settings-menu/utils/withConfirm";
import TagRepository from "db/tag/tag.repository";

/* =========================
EMPTY TAGS
========================= */
const emptyTagsMenu = new ManagedMenu<MyContext>("empty-tags-menu", async (ctx) => {
    const main = ctx.t("settings-main.header");
    const group = ctx.t("settings-group.header", {
        groupName: ctx.session.selectedGroup.groupName,
    });
    const header = ctx.t("settings-del-empty.header");
    const description = ctx.t("settings-del-empty.description");
    return `${main}\n\n${group}\n\n${header}\n\n${description}`;
})
.dynamic(async (ctx, range) => {

    const tagRepository = new TagRepository();
    const tags = await tagRepository.getByGroup(ctx.session.selectedGroup.id);
    const emptyTags = tags.filter(t => t.subscribersNum === 0).map(t => t.name);
    
    if(emptyTags.length === 0) {
        range.text(ctx.t("settings-del-empty.none"));
        return;
    }

    // 2 Tags for each row
    emptyTags.forEach((tag, index) => {
        withConfirm(ctx, range, `empty-${tag}`, { idle: `#${tag}`, confirm: ctx.t("settings-misc.confirm")}, async () => {
            await tagRepository.delete(ctx.session.selectedGroup.id, tag);
            ctx.menu.update();
        });
        if (index % 2 !== 0) range.row();
    });
    
    // Filler if tags are odd
    if (emptyTags.length % 2 !== 0) {
        range.text(" ").row();
    }
    
    // Delete all
    if (emptyTags.length > 0) {
        withConfirm(ctx, range, "bulk-empty", { idle: ctx.t("settings-del-empty.all"), confirm: ctx.t("settings-misc.confirm")}, async () => {
            await tagRepository.deleteEmpty(ctx.session.selectedGroup.id);
            ctx.menu.update();
        });
        range.row();
    }
})
.row()
.back(ctx => ctx.t("settings-misc.back"), (ctx: MyContext) => ctx.session.confirmMap = {});

export default emptyTagsMenu;