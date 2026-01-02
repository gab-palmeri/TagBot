import { TagDTO } from "./tag.dto";
import { SubscriberDTO } from "../../db/subscriber/subscriber.dto";

export interface ITagRepository {
  create(groupId: string, tagName: string, userId: string);
  delete(groupId: string, tagName: string);
  rename(groupId: string, oldTagName: string, newTagName: string);
  updateLastTagged(groupId: string, tagName: string);
  get(groupId: string, tagName: string): Promise<TagDTO>;
  getSubscribers(groupId: string, tagName: string): Promise<SubscriberDTO[]>;
  getByGroup(groupId: string): Promise<TagDTO[]>;
}