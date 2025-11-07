import { Group } from "@db/entity/Group";
import { Tag } from "@db/entity/Tag";
import { TagDTO } from "./tag.dto";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default class TagRepository {

    static async createTag(groupId: string, tagName: string, userId: string): Promise<string | true> {
        try {
            const group = await Group.findOne({where: {groupId: groupId}});

            if (!group) {
                return "Group not found. Re-add the bot to the group.";
            }
    
            let tag = new Tag();
            tag.name = tagName.toLowerCase();
            tag.creatorId = userId;
            tag.group = group;
            tag = await tag.save();    
            return true;
        }
        catch(error) {
            const response =
                error.code == 'ER_DUP_ENTRY'
                    ? "This tag already exists"
                    : "Internal error. Please try again later.";
            return response;
        }
    }
    
    static async deleteTag(groupId: string, tagName: string): Promise<string | true> {
        try {

            const noHashtagTagName = tagName.startsWith("#") ? tagName.slice(1) : tagName;
            const tag = await Tag.findOne({
                where: {
                    name: noHashtagTagName, 
                    group: {groupId: groupId}
                }
            });
    
            if(!tag) {
                return "This tag doesn't exist";
            }
    
            await tag.remove();
            return true;
        }
        catch(error) {
            console.log(error);
            return "An error occurred";
        }
    }
    
    static async renameTag(groupId: string, oldTagName: string, newTagName: string) {
        try {


            const tag = await Tag.findOne({
                where: {
                    name: oldTagName, 
                    group: {groupId: groupId}
                }
            });
    
            if(!tag) {
                return "This tag doesn't exist";
            }
    
            tag.name = newTagName;
            await tag.save();
            
            return true;
        }
        catch(error) {
            if(error.code == "ER_DUP_ENTRY")
                return "A tag with this name already exists";

            return 'An error occurred';
        }
    }

    static async updateLastTagged(groupId: string, tagName: string) {
        try {
            const tag = await Tag.findOne({ 
                relations: ["group"], 
                where: { 
                    name: tagName, 
                    group: {groupId: groupId} 
                } 
            });
            
            if (!tag) {
                return "Tag not found";
            }

            tag.lastTagged = dayjs.utc().format();
            await tag.save();

            return true;
        }
        catch(error) {
            console.log(error);
            return 'An error occurred';
        }
    }

    static async getTag(groupId: string, tagName: string) {
        try {

            const tag = await Tag.findOne({
                where: {
                    name: tagName, 
                    group: {groupId: groupId}
                }, 
                relations: ["group", "subscribersTags"]
            });
    
            if(!tag) {
                return "This tag doesn't exist";
            }
            
            const foundTagDTO = new TagDTO(
                tag.name,
                tag.creatorId,
                tag.lastTagged
            );
            
            return foundTagDTO;
        }
        catch(e) {
            console.log(e);
            return "Service not available";
        }
    }

    static async getSubscribersByTag(tagName: string, groupId: string) {
        try {
            const tag = await Tag.findOne({
                relations: ["group", "subscribersTags", "subscribersTags.subscriber"], 
                where: { 
                    name: tagName, 
                    group: {groupId: groupId}
                }
            });
    
            if(!tag) {
                return "This tag doesn't exist";
            }
    
            if(tag.subscribersTags.length == 0) {
                return "No one is subscribed to this tag";
            }
    
            const payload = tag.subscribersTags
                .filter(st => st.isActive)
                .map(st => { 
                    return {
                        userId: st.subscriber.userId,
                        username: st.subscriber.username
                    };
                });

            return payload;
        }
        catch(e) {
            console.log(e);
            return "Service not available";
        }
    }

    static async getTagsByGroup(groupId: string) {
        try {
            const group = await Group.findOne({
                where: {groupId: groupId}, 
                relations: ["tags", "tags.subscribersTags"]
            });
            
            if(!group || group.tags.length == 0) {
                return "No tags found";
            }
            
            const tagsDto = group.tags.map(tag => new TagDTO(
                tag.name,
                tag.creatorId,
                tag.lastTagged,
                tag.subscribersTags.length,
            ));
            
            return tagsDto;
        }
        catch(e) {
            console.log(e);
            return "Service not available";
        }
    }
}