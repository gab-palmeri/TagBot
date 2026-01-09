import { MyContext } from "utils/customTypes";
import { ManagedMenu } from "../utils/CustomMenu";
import withConfirm from "settings-menu/utils/withConfirm";
import TagRepository from "db/tag/tag.repository";
import dayjs from "dayjs";

/* =========================
INACTIVE TAGS
========================= */
const inactiveTagsMenu = new ManagedMenu<MyContext>("inactive-tags-menu", async (ctx) => {
	const main = ctx.t("settings-main.header");
	const group = ctx.t("settings-group.header", {
		groupName: ctx.session.selectedGroup.groupName,
	});
	const header = ctx.t("settings-del-inactive.header");
	const description = ctx.t("settings-del-inactive.description");
	return `${main}\n\n${group}\n\n${header}\n\n${description}`;
})
.dynamic(async (ctx, range) => {

    const tagRepository = new TagRepository();
    const tags = await tagRepository.getByGroup(ctx.session.selectedGroup.id);
    const inactiveTags = tags.filter(t => dayjs(t.lastTagged).isBefore(dayjs().subtract(3, "month")))
        .map(t => {
            return {
                "name": t.name,
                "months": dayjs().diff(dayjs(t.lastTagged), "month")
            };
        })
        .sort((a, b) => a.months - b.months);

    if(inactiveTags.length === 0) {
        range.text(ctx.t("settings-del-inactive.none"));
        return;
    }

	// 1 Tag for each row
	inactiveTags.forEach((tag) => {
		withConfirm(ctx, range, `inact-${tag.name}`, { idle: `#${tag.name} (${tag.months}m)`, confirm: ctx.t("settings-misc.confirm")}, async () => {
			await tagRepository.delete(ctx.session.selectedGroup.id, tag.name);
			ctx.menu.update();
		});
		range.row();
	});
	
	// Months filters
	[3, 6, 12].forEach(m => {
		withConfirm(ctx, range, `bulk-inact-${m}`, { idle: `🗑️ ≥${m}m`, confirm: ctx.t("settings-misc.confirm")}, async () => {
			await tagRepository.deleteInactive(ctx.session.selectedGroup.id, m);
			ctx.menu.update();
		});
	});
})
.row()
.back(ctx => ctx.t("settings-misc.back"), (ctx: MyContext) => ctx.session.confirmMap = {});

export default inactiveTagsMenu;