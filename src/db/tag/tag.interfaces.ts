import { TagDTO } from "./tag.dto";
import { SubscriberDTO } from "../../db/subscriber/subscriber.dto";

export interface ITagRepository {
  create(group_id: number, tagName: string, userId: string);
  delete(group_id: number, tagName: string);
  rename(group_id: number, oldTagName: string, newTagName: string);
  updateLastTagged(group_id: number, tagName: string);
  get(group_id: number, tagName: string): Promise<TagDTO>;
  getSubscribers(group_id: number, tagName: string): Promise<SubscriberDTO[]>;
  getByGroup(group_id: number): Promise<TagDTO[]>;
}