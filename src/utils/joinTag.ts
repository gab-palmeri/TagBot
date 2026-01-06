import UserRepository from "db/user/user.repository";
import TagRepository from "db/tag/tag.repository";
import SubscriberRepository from "db/subscriber/subscriber.repository";
import GroupRepository from "db/group/group.repository";

type JoinTagResult = "START_BOT" | "JOINED" | "ALREADY_SUBSCRIBED" | "TAG_NOT_FOUND";



export async function joinTag(
  tagName: string,
  groupId: string,
  userId: string
): Promise<JoinTagResult> {

  const subscriberRepository = new SubscriberRepository();
  const userRepository = new UserRepository();
  const tagRepository = new TagRepository();
  const groupRepository = new GroupRepository();

  const group = await groupRepository.getGroup(groupId);
  if (!group) {
    return "TAG_NOT_FOUND";
  }

  const user = await userRepository.getUser(userId);
  if (!user || !user.hasBotStarted) {
    return "START_BOT";
  }

  const tag = await tagRepository.get(group.id, tagName);
  if (!tag) {
    return "TAG_NOT_FOUND";
  }

  const isSubscribed = await subscriberRepository.isSubscribedToTag(group.id, tagName, userId);
  if (isSubscribed) {
    return "ALREADY_SUBSCRIBED";
  }

  await subscriberRepository.joinTag(group.id, tagName, userId);

  return "JOINED";
}

