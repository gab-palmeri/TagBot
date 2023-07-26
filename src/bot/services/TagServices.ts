import { Tag } from "../../entity/Tag";

export default class TagServices {


    static async updateLastTagged(tagName: string, groupId: number) {

        const tag = await Tag.findOne({ relations: ["group"], where: { name: tagName, group: {groupId: groupId} } });
        if (!tag) {
            return { state: "NOT_FOUND", message: "Tag not found" };
        }

        tag.lastTagged = new Date();
        await tag.save();

        return { state: "ok", message: null };
    }
}