import { TagDTO } from "../../db/tag/tag.dto";

export interface ISubscriberRepository {
    joinTag(group_id: number, tagName: string, userId: string, username: string)
    leaveTag(group_id: number, tagName: string, userId: string)
    getSubscriberTags(userId: string, group_id: number): Promise<TagDTO[]>;
    setActiveFlag(group_id: number, userId: string, isActive: boolean)
    isSubscribedToTag(group_id: number, tagName: string, userId: string)
}
