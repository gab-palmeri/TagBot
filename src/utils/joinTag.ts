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
    userId: string
): Promise<JoinTagResponse> {

    const subscriberRepository = new SubscriberRepository();
    const userRepository = new UserRepository();
    const tagRepository = new TagRepository();

    // Check user
    const userResult = await userRepository.getUser(userId);
    if (userResult.ok === false) {
        switch (userResult.error) {
            case "NOT_FOUND": {
                const [msg, inlineText] = msgJoinStartBot(username);
                return { message: msg, inlineKeyboard: { text: inlineText, url: `https://t.me/${username}?start=${groupId}_${tagName}` } };
            }
            case "DB_ERROR":
                return { message: "⚠️ An internal error occurred" };
        }
    }

    // Check tag
    const tag = await tagRepository.get(groupId, tagName);
    if (tag.ok === false) {
        switch (tag.error) {
            case "NOT_FOUND":
                return { message: `⚠️ Tag #${tagName} not found in this group, @${username}` };
            case "DB_ERROR":
                return { message: "⚠️ An internal error occurred, please try again later, @" + username };
        }
    }

    // Join tag
    const joinResult = await subscriberRepository.joinTag(groupId, tagName, userId);
    if (joinResult.ok === true) {
        const [msg, inlineText] = msgJoinPublic(tagName, username);
        return { message: msg, inlineKeyboard: { text: inlineText, callbackData: `join-tag_${tagName}` } };
    } else {
        switch (joinResult.error) {
            case "ALREADY_EXISTS":
                return { message: "⚠️ You are already subscribed to tag #" + tagName + ", @" + username };
            case "DB_ERROR":
                return { message: "⚠️ An internal error occurred, please try again later, @" + username };
        }
    }

    // fallback (non dovrebbe mai succedere)
    return { message: "⚠️ Unknown error occurred" };
}
