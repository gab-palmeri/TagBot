import UserRepository from "@db/user/user.repository";
import TagRepository from "@db/tag/tag.repository";
import SubscriberRepository from "db/subscriber/subscriber.repository";

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

    // Check if user started the bot
    const userResult = await userRepository.getUser(userId);
    console.log(userResult);
    if(userResult === null || !userResult.hasBotStarted) {

        const msg = translate("join-start-bot");
        const inlineText = translate("join-start-bot-button");

        return { message: msg, inlineKeyboard: { text: inlineText, url: `https://t.me/${botUsername}?start=${groupId}_${tagName}` } };
    }

    // Check if tag exists
    const tag = await tagRepository.get(groupId, tagName);
    if (tag === null) {
        return { message: translate("tag-not-found", { tagName }) };
    }

    // Check if already subscribed
    const isSubscribed = await subscriberRepository.isSubscribedToTag(groupId, tagName, userId);

    if (isSubscribed) {
        return { message: translate("already-subscribed-error", { tagName }) };
    }

    // Join tag
    await subscriberRepository.joinTag(groupId, tagName, userId);

    const msg = translate("join-public", { tagName, username });
    const inlineText = translate("join-public-inline-button");

    return { message: msg, inlineKeyboard: { text: inlineText, callbackData: `join-tag_${tagName}` } };
}
