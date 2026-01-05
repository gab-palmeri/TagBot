//Dto class that holds groups
export class GroupDTO {
    constructor(
        public id: number,
        public groupId: string,
        public groupName: string,
        public canCreate: number = 0,
        public canDelete: number = 0,
        public canRename: number = 0,
        public isActive: boolean = true,
        public lang: string = "en"
    ) {
        this.id = id;
        this.groupId = groupId;
        this.groupName = groupName;
        this.canCreate = canCreate;
        this.canDelete = canDelete;
        this.canRename = canRename;
        this.isActive = isActive;
        this.lang = lang;
    }
}
