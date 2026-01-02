import { TagDTO } from "../../db/tag/tag.dto";

export interface ISubscriberRepository {
    joinTag(groupId: string, tagName: string, userId: string, username: string)
    leaveTag(groupId: string, tagName: string, userId: string)
    getSubscriberTags(userId: string, groupId: string): Promise<TagDTO[]>;
    setActiveFlag(groupId: string, userId: string, isActive: boolean)
    isSubscribedToTag(groupId: string, tagName: string, userId: string)
}
