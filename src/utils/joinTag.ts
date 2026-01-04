import UserRepository from "@db/user/user.repository";
import TagRepository from "@db/tag/tag.repository";
import SubscriberRepository from "db/subscriber/subscriber.repository";
import GroupRepository from "@db/group/group.repository";

type JoinTagResponse = {
    message: string;
    inlineKeyboard?: { text: string; url?: string; callbackData?: string };
};

type TranslateFn = (key: string, params?: Record<string, any>) => string;

export async function joinTag(
    translate: TranslateFn,
    tagName: string,
    groupId: string,
    username: string,
    botUsername: string,
    userId: string
): Promise<JoinTagResponse> {

    const subscriberRepository = new SubscriberRepository();
    const userRepository = new UserRepository();
    const tagRepository = new TagRepository();
    const groupRepository = new GroupRepository();

    // Get group
    const group = await groupRepository.getGroup(groupId);
    
    // Check if user started the bot
    const userResult = await userRepository.getUser(userId);

    if(userResult === null || !userResult.hasBotStarted) {

        const msg = translate("join-start-bot");
        const inlineText = translate("join-start-bot-button");

        return { message: msg, inlineKeyboard: { text: inlineText, url: `https://t.me/${botUsername}?start=${groupId}_${tagName}` } };
    }

    // Check if tag exists
    const tag = await tagRepository.get(group.id, tagName);
    if (tag === null) {
        return { message: translate("tag-not-found", { tagName }) };
    }

    // Check if already subscribed
    const isSubscribed = await subscriberRepository.isSubscribedToTag(group.id, tagName, userId);

    if (isSubscribed) {
        return { message: translate("already-subscribed-error", { tagName }) };
    }

    // Join tag
    await subscriberRepository.joinTag(group.id, tagName, userId);

    const msg = translate("join-public", { tagName, username });
    const inlineText = translate("join-public-inline-button");

    return { message: msg, inlineKeyboard: { text: inlineText, callbackData: `join-tag_${tagName}` } };
}
