import UserRepository from "@db/user/user.repository";
import TagRepository from "@db/tag/tag.repository";
import SubscriberRepository from "db/subscriber/subscriber.repository";
import { msgJoinPublic, msgJoinStartBot } from "@messages/subscriberMessages";

type JoinTagResponse = {
    message: string;
    inlineKeyboard?: { text: string; url?: string; callbackData?: string };
};

export async function joinTag(
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
    if(userResult === null || !userResult.hasBotStarted) {
        const [msg, inlineText] = msgJoinStartBot(username);
        return { message: msg, inlineKeyboard: { text: inlineText, url: `https://t.me/${botUsername}?start=${groupId}_${tagName}` } };
    }

    // Check if tag exists
    const tag = await tagRepository.get(groupId, tagName);
    if (tag === null) {
        return { message: `⚠️ Tag #${tagName} not found in this group, @${username}` };
    }

    // Check if already subscribed
    const isSubscribed = await subscriberRepository.isSubscribedToTag(groupId, tagName, userId);

    if (isSubscribed) {
        return { message: "⚠️ You are already subscribed to tag #" + tagName + ", @" + username };
    }

    // Join tag
    await subscriberRepository.joinTag(groupId, tagName, userId);

    const [msg, inlineText] = msgJoinPublic(tagName, username);
    return { message: msg, inlineKeyboard: { text: inlineText, callbackData: `join-tag_${tagName}` } };
}
