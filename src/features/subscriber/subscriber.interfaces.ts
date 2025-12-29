import { Result } from "shared/result";
import { TagDTO } from "../tag/tag.dto";

export interface ISubscriberRepository {
    joinTag(groupId: string, tagName: string, userId: string, username: string): Promise<Result<null, "ALREADY_EXISTS" | "DB_ERROR">>;
    leaveTag(groupId: string, tagName: string, userId: string): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
    //TODO: spostare in user??
    getSubscriberTags(userId: string, groupId: string): Promise<Result<TagDTO[], "NOT_FOUND" | "DB_ERROR">>;
    setActiveFlag(groupId: string, userId: string, isActive: boolean): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
}

export interface ISubscriberService {
    joinTag(groupId: string, tagName: string, userId: string): Promise<Result<null, "BOT_NOT_STARTED" | "ALREADY_EXISTS" | "INTERNAL_ERROR" | "NOT_FOUND">>;
    leaveTag(groupId: string, tagName: string, userId: string): Promise<Result<null, "NOT_FOUND" | "INTERNAL_ERROR">>;
    getSubscriberTags(userId: string, groupId: string): Promise<Result<TagDTO[], "NOT_FOUND" | "INTERNAL_ERROR">>;
    setActiveFlag(groupId: string, userId: number, isActive: boolean): Promise<Result<null, "NOT_FOUND" | "INTERNAL_ERROR">>;
}