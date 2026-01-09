import { TagDTO } from "./tag.dto";
import { UserDTO } from "db/user/user.dto";

export interface ITagRepository {
  create(group_id: number, tagName: string, userId: string);
  delete(group_id: number, tagName: string);
  deleteEmpty(group_id: number);
  deleteInactive(group_id: number, months: number);
  rename(group_id: number, oldTagName: string, newTagName: string);
  updateLastTagged(group_id: number, tagName: string);
  get(group_id: number, tagName: string): Promise<TagDTO>;
  getSubscribers(group_id: number, tagName: string): Promise<UserDTO[]>;
  getByGroup(group_id: number): Promise<TagDTO[]>;
}