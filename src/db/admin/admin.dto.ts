//dto class for admin

import { GroupDTO } from "db/group/group.dto";

export class AdminDTO {
    constructor(
        public userId: string,
        public groups: GroupDTO[] = []
    ) {
        this.userId = userId;
        this.groups = groups;
    }
}