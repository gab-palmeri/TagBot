//DTO class that represents a tag

export class TagDTO {
    name: string;
    creatorId: string;
    lastTagged: string;
    subscribersNum: number;

    constructor(name: string, creatorId = "", lastTagged = "", subscribersNum = 0) {
        this.name = name;
        this.creatorId = creatorId;
        this.lastTagged = lastTagged;
        this.subscribersNum = subscribersNum;
    }
}