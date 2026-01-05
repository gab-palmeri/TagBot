import UserRepository from "db/user/user.repository";
import TagRepository from "db/tag/tag.repository";
import SubscriberRepository from "db/subscriber/subscriber.repository";
import GroupRepository from "db/group/group.repository";
import { TranslateFn } from "./customTypes";

type JoinTagResponse = {
    message: string;
    inlineKeyboard?: { text: string; url?: string; callbackData?: string };
};

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

        const msg = translate("join.start-bot-msg");
        const inlineText = translate("join.start-bot-btn");

        return { message: msg, inlineKeyboard: { text: inlineText, url: `https://t.me/${botUsername}?start=${groupId}_${tagName}` } };
    }

    // Check if tag exists
    const tag = await tagRepository.get(group.id, tagName);
    if (tag === null) {
        return { message: translate("tag.validation-not-found", { tagName, count: 1 }) };
    }

    // Check if already subscribed
    const isSubscribed = await subscriberRepository.isSubscribedToTag(group.id, tagName, userId);

    if (isSubscribed) {
        return { message: translate("join.already-subscribed", { tagName }) };
    }

    // Join tag
    await subscriberRepository.joinTag(group.id, tagName, userId);

    const msg = translate("join.ok", { tagName, username });
    const inlineText = translate("join.btn");

    return { message: msg, inlineKeyboard: { text: inlineText, callbackData: `join-tag_${tagName}` } };
}
