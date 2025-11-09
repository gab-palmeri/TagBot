import { Group } from "@db/entity/Group";
import { Tag } from "@db/entity/Tag";
import { TagDTO } from "./tag.dto";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { SubscriberDTO } from "features/subscriber/subscriber.dto";
import { ITagRepository } from "./tag.interfaces";
import { err, ok } from "shared/result";

dayjs.extend(utc);

export default class TagRepository implements ITagRepository {

    //TODO: controllo se il gruppo esiste farlo a monte
    public async createTag(groupId: string, tagName: string, userId: string) {
        try {
            const group = await Group.findOne({where: {groupId: groupId}});
    
            let tag = new Tag();
            tag.name = tagName.toLowerCase();
            tag.creatorId = userId;
            tag.group = group;
            tag = await tag.save();    
            return ok(null);
        }
        catch(e) {
            if(e.code == 'ER_DUP_ENTRY') {
                return err("ALREADY_EXISTS");
            }
            else {
                return err("DB_ERROR");
            }
        }
    }
    
    public async deleteTag(groupId: string, tagName: string) {
        try {
            const tag = await Tag.findOne({
                where: {
                    name: tagName, 
                    group: {groupId: groupId}
                }
            });
    
            if(!tag) {
                return err("NOT_FOUND");
            }
    
            await tag.remove();
            return ok(null);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }
    
    public async renameTag(groupId: string, oldTagName: string, newTagName: string) {
        try {


            const tag = await Tag.findOne({
                where: {
                    name: oldTagName, 
                    group: {groupId: groupId}
                }
            });
    
            if(!tag) {
                return err("NOT_FOUND");
            }
    
            tag.name = newTagName;
            await tag.save();
            
            return ok(null);
        }
        catch(e) {
            if(e.code == "ER_DUP_ENTRY")
                return err("ALREADY_EXISTS");
            else {
                return err("DB_ERROR");
            }
        }
    }

    public async updateLastTagged(groupId: string, tagName: string) {
        try {
            const tag = await Tag.findOne({ 
                relations: ["group"], 
                where: { 
                    name: tagName, 
                    group: {groupId: groupId} 
                } 
            });
            
            if (!tag) {
                return err("NOT_FOUND");
            }

            tag.lastTagged = dayjs.utc().format();
            await tag.save();

            return ok(null);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    public async getTag(groupId: string, tagName: string) {
        try {

            const tag = await Tag.findOne({
                where: {
                    name: tagName, 
                    group: {groupId: groupId}
                }, 
                relations: ["group", "subscribersTags"]
            });
    
            if(!tag) {
                return err("NOT_FOUND");
            }
            
            const foundTagDTO = new TagDTO(
                tag.name,
                tag.creatorId,
                tag.lastTagged
            );
            
            return ok(foundTagDTO);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    public async getSubscribersByTag(tagName: string, groupId: string) {
        try {
            const tag = await Tag.findOne({
                relations: ["group", "subscribersTags", "subscribersTags.subscriber"], 
                where: { 
                    name: tagName, 
                    group: {groupId: groupId}
                }
            });
    
            if(!tag) {
                return err("NOT_FOUND");
            }
    
            if(tag.subscribersTags.length == 0) {
                return err("NO_CONTENT");
            }
    
            const subscribers = tag.subscribersTags
                .filter(st => st.isActive)
                .map(st => { 
                    return new SubscriberDTO(
                        st.subscriber.userId,
                        st.subscriber.username
                    );
                });

            return ok(subscribers);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    public async getTagsByGroup(groupId: string) {
        try {
            const group = await Group.findOne({
                where: {groupId: groupId}, 
                relations: ["tags", "tags.subscribersTags"]
            });
            
            if(!group || group.tags.length == 0) {
                return err("NOT_FOUND");
            }
            
            const tagsDto = group.tags.map(tag => new TagDTO(
                tag.name,
                tag.creatorId,
                tag.lastTagged,
                tag.subscribersTags.length,
            ));
            
            return ok(tagsDto);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }
}