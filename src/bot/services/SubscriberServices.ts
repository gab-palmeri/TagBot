import { Group } from '../../entity/Group';
import { Tag } from '../../entity/Tag';
import { Subscriber } from '../../entity/Subscriber';

export default class SubscriberServices {
	static async joinTag(groupId: number, tagName: string, userId: string) {

		const tagResponse = await SubscriberServices.getTag(groupId, tagName); 
	
		if(tagResponse.state != "ok") {
			return tagResponse;
		}
	
		const tag = tagResponse.payload;
	
		if(tag.subscribers.length >= 50) {
			return { state: "TAG_FULL", message: "This tag is full" };
		}
			
		try {
			//add the tag to the subscriber
			let subscriber = await Subscriber.findOne({where: {userId: userId}, relations: ["tags"]});
	
			if(!subscriber) {
				subscriber = new Subscriber();
				subscriber.userId = userId;
				subscriber.tags = [tag];
				subscriber = await subscriber.save();
			}
			else {
				if(subscriber.tags.find(n => n.id == tag.id))
					return {state: "ALREADY_SUBSCRIBED", message: "You are already subscribed to this tag"};
	
				subscriber.tags.push(tag);
				await subscriber.save();
			}
	
			return {state: "ok", message: null};
		}
		catch(err) {
			console.log(err);
			return {state: "error", message: "Internal server error"};
		}
		
	}
	
	static async leaveTag(groupId: number, tagName: string, userId: string) {
		const tagResponse = await SubscriberServices.getTag(groupId, tagName);
	
		if (tagResponse.state != 'ok') {
			return tagResponse;
		}
	
		const tag = tagResponse.payload;
	
		try {
			//remove the tag from the subscriber
			const subscriber = await Subscriber.findOne({relations: ["tags"], where: {userId: userId}, });
	
			if(!subscriber || !subscriber.tags.find(n => n.id == tag.id)) {
				return {state: "NOT_SUBSCRIBED", message: "You're not subscribed to this tag"};
			}
			else {
				subscriber.tags = subscriber.tags.filter(n => n.id != tag.id);
				await subscriber.save();
			}
	
			return {state: "ok", message: null};
		}
		catch(err) {
			console.log(err);
			return {state: "error", message: "Internal server error"};
		}
		
	}
	
	static async getSubscribers(tagName: string, groupId: number) {
		
		try {
			//get tag belonging to the group
			const tag = await Tag.findOne({relations: ["group", "subscribers"], where: { name: tagName, group: {groupId: groupId}}});
	
			if(!tag) 
				return {state: "NOT_EXISTS", message: "This tag doesn't exist"};
	
			if(tag.subscribers.length == 0)
				return {state: "TAG_EMPTY", message: "No one is subscribed to this tag"};
	
			return {
				state: "ok", 
				payload: tag.subscribers.map(s => { 
					return {
						userId: s.userId,
						username: s.username
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
			const group = await Group.findOne({where: {groupId: groupId}, relations: ["tags", "tags.subscribers"]});
			if(!group || group.tags.length == 0) {
				return {state: "error", message: "No tags found"};
			}
			else
				return {state: "ok", payload: group.tags};
		}
		catch {
			return {state: "error", message: "Service not available"};
		}
	}
	
	static async getSubscriberTags(userId: string, groupId: number) {
	
		try {
	
			//find all tags belonging to the group and the subscriber
			const tags = await Tag.find({relations: ["group", "subscribers"], where: {group: {groupId: groupId}, subscribers: {userId: userId}}});
	
			if (!tags || tags.length == 0) {
				return { state: 'error', message: "You are not subscribed to any tag" };
			} else return { state: 'ok', payload: tags };
		}
		catch(e) {
			console.log(e);
			return {state: "error", message: "Service not available"};
		}
	}
	
	static async getTag(groupId: number, tagName: string) {
	
		try {
			const tag = await Tag.findOne({where: {name: tagName, group: {groupId: groupId}}, relations: ["group", "subscribers"]});
	
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

	static async getSubscriber(userId: string) {
		try {
			const subscriber = await Subscriber.findOne({where: {userId: userId}, relations: ["tags"]});
	
			if(!subscriber)
				return {state: "NOT_EXISTS", message: "This subscriber doesn't exist"};
			else
				return {state: "ok", payload: subscriber};
		}
		catch(e) {
			console.log(e);
			return {state: "error", message: "Service not available"};
		}
	}

	static async updateSubscriberUsername(userId: string, username: string) {
		try {
			const subscriber = await Subscriber.findOne({where: {userId: userId}});
	
			if(!subscriber)
				return {state: "NOT_EXISTS", message: "This subscriber doesn't exist"};
			else {
				subscriber.username = username;
				await subscriber.save();
				return {state: "ok", payload: subscriber};
			}
		}
		catch(e) {
			console.log(e);
			return {state: "error", message: "Service not available"};
		}
	}
}

