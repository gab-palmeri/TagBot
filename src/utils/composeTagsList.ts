import { TagDTO } from "@db/tag/tag.dto";
import { MyContext } from "./customTypes";

// Opzioni generali per la composizione
interface TagListOptions {
    tags?: TagDTO[];
    groupName?: string;
    username?: string;
    fullList?: boolean;
    mainTags?: TagDTO[];
    otherTags?: TagDTO[];
}


export function composeTagList(ctx: MyContext, opts: TagListOptions): string {
    const { tags, groupName, username, fullList, mainTags, otherTags } = opts;
    let message = "";

    // Header
    if (username) {
        message += ctx.t("my-tags-header", { username }) + "\n\n";
    } else if (fullList) {
        message += ctx.t("list-tags-full", { groupName }) + "\n\n";
    } else {
        message += ctx.t("list-tags-partial") + "\n\n";
    }

    // Main tags
    if (mainTags && mainTags.length) {
        message += ctx.t("list-main-tags-header") + "\n";
        message += mainTags.map(tag => ctx.t("tag-entry", { tagName: tag.name, count: tag.subscribersNum })).join("\n");
        message += "\n\n";
    }

    // Other tags
    if (otherTags && otherTags.length) {
        message += ctx.t("list-other-tags-header") + "\n";
        message += otherTags.map(tag => ctx.t("tag-entry", { tagName: tag.name, count: tag.subscribersNum })).join("\n");
        message += "\n\n";
    }

    // Lista generica se non main/other
    if ((!mainTags || !mainTags.length) && (!otherTags || !otherTags.length)) {
        message += tags.map(tag => ctx.t("tag-entry", { tagName: tag.name, count: tag.subscribersNum })).join("\n");
    }

    return message.trim();
}