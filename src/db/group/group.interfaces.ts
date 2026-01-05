// group.repository.interface.ts
import { GroupDTO } from "./group.dto";

type EditableGroupFields = Partial<
  Pick<GroupDTO, "groupName" | "isActive" | "lang">
>;

export interface IGroupRepository {
  createGroup(groupID: string, groupName: string);
  getGroup(groupID: string): Promise<GroupDTO>;
  migrateGroup(oldGroupID: string, newGroupID: string);
  getAllActiveGroups(): Promise<GroupDTO[]>;
  update(groupID: string, fields: EditableGroupFields)
}
