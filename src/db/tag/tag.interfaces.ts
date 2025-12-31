import { TagDTO } from "./tag.dto";
import { SubscriberDTO } from "../../db/subscriber/subscriber.dto";
import { Result } from "@utils/result";

export interface ITagRepository {
  create(groupId: string, tagName: string, userId: string): Promise<Result<null, "ALREADY_EXISTS" | "DB_ERROR">>;
  delete(groupId: string, tagName: string): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
  rename(groupId: string, oldTagName: string, newTagName: string): Promise<Result<null, "NOT_FOUND" | "ALREADY_EXISTS" | "DB_ERROR">>;
  updateLastTagged(groupId: string, tagName: string): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
  get(groupId: string, tagName: string): Promise<Result<TagDTO, "NOT_FOUND" | "DB_ERROR">>;
  getSubscribers(groupId: string, tagName: string): Promise<Result<SubscriberDTO[], "DB_ERROR">>;
  getByGroup(groupId: string): Promise<Result<TagDTO[], "NOT_FOUND" | "DB_ERROR">>;
}