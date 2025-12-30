import { Result } from "@utils/result";
import { TagDTO } from "../../db/tag/tag.dto";

export interface ISubscriberRepository {
    joinTag(groupId: string, tagName: string, userId: string, username: string): Promise<Result<null, "ALREADY_EXISTS" | "DB_ERROR">>;
    leaveTag(groupId: string, tagName: string, userId: string): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
    getSubscriberTags(userId: string, groupId: string): Promise<Result<TagDTO[], "DB_ERROR">>;
    setActiveFlag(groupId: string, userId: string, isActive: boolean): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
}
