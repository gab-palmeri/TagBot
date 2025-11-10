import { Result } from "shared/result";
import { TagDTO } from "../tag/tag.dto";
import { SubscriberDTO } from "../subscriber/subscriber.dto";

export interface ISubscriberRepository {
    joinTag(
        groupId: string,
        tagName: string,
        userId: string,
        username: string
    ): Promise<Result<null, "ALREADY_EXISTS" | "DB_ERROR">>;

    leaveTag(
        groupId: string,
        tagName: string,
        userId: string
    ): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;

    getSubscriberTags(
        userId: string,
        groupId: string
    ): Promise<Result<TagDTO[], "NOT_FOUND" | "DB_ERROR">>;

    getSubscriber(
        userId: string
    ): Promise<Result<SubscriberDTO, "NOT_FOUND" | "DB_ERROR">>;

    updateSubscriberUsername(
        userId: string,
        username: string
    ): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;

    setInactive(
        groupId: string,
        userId: string
    ): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;

    setActive(
        groupId: string,
        userId: string
    ): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
}

export interface ISubscriberService {
    joinTag(
        groupId: string,
        tagName: string,
        userId: string
    ): Promise<Result<null, "BOT_NOT_STARTED" | "ALREADY_EXISTS" | "INTERNAL_ERROR" | "NOT_FOUND">>;

    leaveTag(
        groupId: string,
        tagName: string,
        userId: string
    ): Promise<Result<null, "NOT_FOUND" | "INTERNAL_ERROR">>;

    getSubscriberTags(
        userId: string,
        groupId: string
    ): Promise<Result<TagDTO[], "NOT_FOUND" | "INTERNAL_ERROR">>;

    getSubscriber(
        userId: string
    ): Promise<Result<SubscriberDTO, "NOT_FOUND" | "INTERNAL_ERROR">>;

    updateSubscriberUsername(
        userId: string,
        username: string
    ): Promise<Result<null, "NOT_FOUND" | "INTERNAL_ERROR">>;

    setInactive(
        groupId: string,
        userId: number
    ): Promise<Result<null, "NOT_FOUND" | "INTERNAL_ERROR">>;

    setActive(
        groupId: string,
        userId: number
    ): Promise<Result<null, "NOT_FOUND" | "INTERNAL_ERROR">>;
}