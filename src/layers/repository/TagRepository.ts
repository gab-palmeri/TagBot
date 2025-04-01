import { Group } from "@db/entity/Group";
import { Tag } from "@db/entity/Tag";
import { Result } from "@utils/Result";
import { TagDTO } from "@dto/TagDTO";
import { GroupDTO } from "@dto/GroupDTO";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default class TagRepository {

    static async createTag(groupDTO: GroupDTO, tagDTO: TagDTO) {
        try {
            const group = await Group.findOne({where: {groupId: groupDTO.groupId}});

            if (!group) {
                return Result.failure(new Error("This group has not been registered by the bot. Please re-add the bot to the group"));
            }
    
            let tag = new Tag();
            tag.name = tagDTO.name.toLowerCase();
            tag.creatorId = tagDTO.creatorId;
            tag.group = group;
            tag = await tag.save();    
            return Result.success();
        }
        catch(error) {
            const response =
                error.code == 'ER_DUP_ENTRY'
                    ? Result.failure(new Error('This tag already exists'))
                    : Result.failure(new Error('An error occurred'));
            return response;
        }
    }
    
    static async deleteTag(groupDTO: GroupDTO, tagDTO: TagDTO) {
        try {
            const tag = await Tag.findOne({
                where: {
                    name: tagDTO.name, 
                    group: {groupId: groupDTO.groupId}
                }
            });
    
            if(!tag) {
                return Result.failure(new Error("This tag doesn't exist"));
            }
    
            await tag.remove();
            return Result.success();
        }
        catch(error) {
            console.log(error);
            return Result.failure(new Error('An error occurred'));
        }
    }
    
    static async renameTag(groupDTO: GroupDTO, oldTagDTO: TagDTO, newTagDTO: TagDTO) {
        try {
            const tag = await Tag.findOne({
                where: {
                    name: oldTagDTO.name, 
                    group: {groupId: groupDTO.groupId}
                }
            });
    
            if(!tag) {
                return Result.failure(new Error("This tag doesn't exist"));
            }
    
            tag.name = newTagDTO.name;
            await tag.save();
            
            return Result.success();
        }
        catch(error) {
            if(error.code == "ER_DUP_ENTRY")
                return Result.failure(new Error("A tag with this name already exists"));

            return Result.failure(new Error('An error occurred'));
        }
    }

    static async updateLastTagged(tagDTO: TagDTO, groupDTO: GroupDTO) {
        try {
            const tag = await Tag.findOne({ 
                relations: ["group"], 
                where: { 
                    name: tagDTO.name, 
                    group: {groupId: groupDTO.groupId} 
                } 
            });
            
            if (!tag) {
                return Result.failure(new Error("Tag not found"));
            }

            tag.lastTagged = dayjs.utc().format();
            await tag.save();

            return Result.success();
        }
        catch(error) {
            console.log(error);
            return Result.failure(new Error('An error occurred'));
        }
    }

    static async getTag(groupDTO: GroupDTO, tagDTO: TagDTO) {
        try {

            const tag = await Tag.findOne({
                where: {
                    name: tagDTO.name, 
                    group: {groupId: groupDTO.groupId}
                }, 
                relations: ["group", "subscribersTags"]
            });
    
            if(!tag) {
                return Result.failure(new Error("This tag doesn't exist"));
            }
            
            const foundTagDTO = new TagDTO(
                tag.name,
                tag.creatorId,
                tag.lastTagged
            );
            
            return Result.success(foundTagDTO);
        }
        catch(e) {
            console.log(e);
            return Result.failure(new Error("Service not available"));
        }
    }

    static async getSubscribersByTag(tagDTO: TagDTO, groupDTO: GroupDTO) {
        try {
            const tag = await Tag.findOne({
                relations: ["group", "subscribersTags", "subscribersTags.subscriber"], 
                where: { 
                    name: tagDTO.name, 
                    group: {groupId: groupDTO.groupId}
                }
            });
    
            if(!tag) {
                return Result.failure(new Error("This tag doesn't exist"));
            }
    
            if(tag.subscribersTags.length == 0) {
                return Result.failure(new Error("No one is subscribed to this tag"));
            }
    
            const payload = tag.subscribersTags
                .filter(st => st.isActive)
                .map(st => { 
                    return {
                        userId: st.subscriber.userId,
                        username: st.subscriber.username
                    };
                });

            return Result.success(payload);
        }
        catch(e) {
            console.log(e);
            return Result.failure(new Error("Service not available"));
        }
    }

    static async getTagsByGroup(groupDTO: GroupDTO) {
        try {
            const group = await Group.findOne({
                where: {groupId: groupDTO.groupId}, 
                relations: ["tags", "tags.subscribersTags"]
            });
            
            if(!group || group.tags.length == 0) {
                return Result.failure(new Error("No tags found"));
            }
            
            const tagsDto = group.tags.map(tag => new TagDTO(
                tag.name,
                tag.creatorId,
                tag.lastTagged,
                tag.subscribersTags.length,
            ));
            
            return Result.success(tagsDto);
        }
        catch(e) {
            console.log(e);
            return Result.failure(new Error("Service not available"));
        }
    }
}