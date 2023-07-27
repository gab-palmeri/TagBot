import { Group } from "../../entity/Group";
import { Tag } from "../../entity/Tag";

import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default class TagServices {


    static async updateLastTagged(tagName: string, groupId: number) {

        const tag = await Tag.findOne({ relations: ["group"], where: { name: tagName, group: {groupId: groupId} } });
        if (!tag) {
            return { state: "NOT_FOUND", message: "Tag not found" };
        }

		tag.lastTagged  = dayjs.utc().format();
        await tag.save();

        return { state: "ok", message: null };
    }

    static async getTag(groupId: number, tagName: string) {
	
		try {
			const tag = await Tag.findOne({where: {name: tagName, group: {groupId: groupId}}, relations: ["group", "subscribersTags"]});
	
			if(!tag)
				return {state: "NOT_EXISTS", message: "This tag doesn't exist"};
			else
				return {state: "ok", payload: tag};
		}
		catch(e) {
			console.log(e);
			return {state: "error", message: "Service not available"};
		}
	}

    static async getTagSubscribers(tagName: string, groupId: number) {
		
		try {
			//get tag belonging to the group
			const tag = await Tag.findOne({relations: ["group", "subscribersTags", "subscribersTags.subscriber"], where: { name: tagName, group: {groupId: groupId}}});
	
			if(!tag) 
				return {state: "NOT_EXISTS", message: "This tag doesn't exist"};
	
			if(tag.subscribersTags.length == 0)
				return {state: "TAG_EMPTY", message: "No one is subscribed to this tag"};
	
			return {
				state: "ok", 
				payload: tag.subscribersTags.filter(st => st.isActive).map(st => { 
					return {
						userId: st.subscriber.userId,
						username: st.subscriber.username
					};
				})
			};
		}
		catch(e) {
			console.log(e);
			return {state: "error", message: "Service not available"};
		}
	}

    static async getGroupTags(groupId: number) {
	
		try {
			const group = await Group.findOne({where: {groupId: groupId}, relations: ["tags", "tags.subscribersTags"]});
			if(!group || group.tags.length == 0) {
				return {state: "error", message: "No tags found"};
			}
			else
				return {state: "ok", payload: group.tags};
		}
		catch(e) {
			console.log(e);
			return {state: "error", message: "Service not available"};
		}
	}
}