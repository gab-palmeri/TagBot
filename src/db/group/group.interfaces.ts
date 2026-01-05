// group.repository.interface.ts
import { GroupDTO } from "./group.dto";

export interface IGroupRepository {
  createGroup(groupID: string, groupName: string);
  getGroup(groupID: string): Promise<GroupDTO>;
  migrateGroup(oldGroupID: string, newGroupID: string);
  setGroupActive(groupID: string, isActive: boolean);
  setLang(groupID: string, lang: string);
}
