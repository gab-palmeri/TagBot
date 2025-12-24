import { TagDTO } from "./tag.dto";
import { SubscriberDTO } from "../subscriber/subscriber.dto";
import { Result } from "shared/result";

export interface ITagRepository {
  createTag(groupId: string, tagName: string, userId: string): Promise<Result<null, "ALREADY_EXISTS" | "DB_ERROR">>;
  deleteTag(groupId: string, tagName: string): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
  renameTag(groupId: string, oldTagName: string, newTagName: string): Promise<Result<null, "NOT_FOUND" | "ALREADY_EXISTS" | "DB_ERROR">>;
  updateLastTagged(groupId: string, tagName: string): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
  getTag(groupId: string, tagName: string): Promise<Result<TagDTO, "NOT_FOUND" | "DB_ERROR">>;
  getSubscribersByTag(tagName: string, groupId: string): Promise<Result<SubscriberDTO[], "NOT_FOUND" | "NO_CONTENT" | "DB_ERROR">>;
  getTagsByGroup(groupId: string): Promise<Result<TagDTO[], "NOT_FOUND" | "DB_ERROR">>;
}


export interface ITagService {
  createTag(groupId: string, tagName: string, userId: string): Promise<Result<null, "INVALID_SYNTAX" | "NOT_FOUND" | "ALREADY_EXISTS" | "INTERNAL_ERROR">>;
  deleteTag(groupId: string, tagName: string): Promise<Result<null, "NOT_FOUND" | "INTERNAL_ERROR">>;
  renameTag(groupId: string, oldTagName: string, newTagName: string): Promise<Result<null, "INVALID_SYNTAX" | "NOT_FOUND" | "ALREADY_EXISTS" | "INTERNAL_ERROR">>;
  updateLastTagged(groupId: string, tagName: string): Promise<Result<null, "NOT_FOUND" | "INTERNAL_ERROR">>;
  getTag(groupId: string, tagName: string): Promise<Result<TagDTO, "NOT_FOUND" | "INTERNAL_ERROR">>;
  getTagSubscribers(tagName: string, groupId: string): Promise<Result<SubscriberDTO[], "NOT_FOUND" | "NO_CONTENT" | "INTERNAL_ERROR">>;
  getTagsByGroup(groupId: string): Promise<Result<{ mainTags: TagDTO[]; secondaryTags: TagDTO[] | null }, "NOT_FOUND" | "INTERNAL_ERROR">>;
}