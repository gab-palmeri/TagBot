import { Tag } from '../../entity/Tag';
import { Subscriber } from '../../entity/Subscriber';
import { SubscriberTag } from '../../entity/SubscriberTag';
import TagServices from './TagServices';

export default class SubscriberServices {
   
	static async joinTag(groupId: number, tagName: string, userId: string) {

		const tagResponse = await TagServices.getTag(groupId, tagName); 
	
		if(tagResponse.state != "ok") {
			return tagResponse;
		}
	
		const tag = tagResponse.payload;
	
		if(tag.subscribersTags.length >= 50) {
			return { state: "TAG_FULL", message: "This tag is full" };
		}
			
		try {
			//add the tag to the subscriber
			let subscriber = await Subscriber.findOne({where: {userId: userId}, relations: ["subscribersTags", "subscribersTags.tag"]});
	
			if(!subscriber) {
				subscriber = new Subscriber();
				subscriber.userId = userId;

				const subscribersTags = new SubscriberTag();
				subscribersTags.subscriber = subscriber;
				subscribersTags.tag = tag;
				subscriber.subscribersTags = [subscribersTags];

				subscriber = await subscriber.save();
			}
			else {
				if(subscriber.subscribersTags.find(n => n.tag.id == tag.id))
					return {state: "ALREADY_SUBSCRIBED", message: "You are already subscribed to this tag"};
	

				const subscribersTags = new SubscriberTag();
				subscribersTags.subscriber = subscriber;
				subscribersTags.tag = tag;

				subscriber.subscribersTags.push(subscribersTags);
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
		const tagResponse = await TagServices.getTag(groupId, tagName);
	
		if (tagResponse.state != 'ok') {
			return tagResponse;
		}
	
		const tag = tagResponse.payload;
	
		try {
			//remove the tag from the subscriber
			const subscriber = await Subscriber.findOne({relations: ["subscribersTags", "subscribersTags.tag"], where: {userId: userId}, });
	
			if(!subscriber?.subscribersTags.find(n => n.tag.id == tag.id)) {
				return {state: "NOT_SUBSCRIBED", message: "You're not subscribed to this tag"};
			}
			else {

				await subscriber.subscribersTags.find(n => n.tag.id == tag.id).remove();

				subscriber.subscribersTags = subscriber.subscribersTags.filter(n => n.tag.id != tag.id);
				
				await subscriber.save();
			}
	
			return {state: "ok", message: null};
		}
		catch(err) {
			console.log(err);
			return {state: "error", message: "Internal server error"};
		}
		
	}
	
	static async getSubscriberTags(userId: string, groupId: number) {
	
		try {
	
			//find all tags belonging to the group and the subscriber
			const tags = await Tag.find({relations: ["group", "subscribersTags", "subscribersTags.subscriber"], where: {group: {groupId: groupId}, subscribersTags: { subscriber: {userId: userId}}}});
	
			if (!tags || tags.length == 0) {
				return { state: 'error', message: "You are not subscribed to any tag" };
			} else return { state: 'ok', payload: tags };
		}
		catch(e) {
			console.log(e);
			return {state: "error", message: "Service not available"};
		}
	}
	
	

	static async getSubscriber(userId: string) {
		try {
			const subscriber = await Subscriber.findOne({where: {userId: userId}});
	
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

	static async setInactive(groupId: number, userId: number) {

        try {
			//take the SubscriberTag relation which correspond to all the tags in the groupId and the userId and set them to inactive
			const subscriberTag = await SubscriberTag.find({relations: ["subscriber", "tag"], where: {subscriber: {userId: userId.toString()}, tag: {group: {groupId: groupId}}}});

			if(subscriberTag && subscriberTag.length > 0)
				subscriberTag.forEach(st => {

					st.isActive = false;
					st.save().catch(e => console.log(e));
				});

		}
		catch(e) {
			console.log(e);
		}
    }

	static async setActive(groupId: number, userId: number) {
        try {
			//take the SubscriberTag relation which correspond to all the tags in the groupId and the userId and set them to inactive
			const subscriberTag = await SubscriberTag.find({relations: ["subscriber", "tag"], where: {subscriber: {userId: userId.toString()}, tag: {group: {groupId: groupId}}}});

			if(subscriberTag && subscriberTag.length > 0)
				subscriberTag.forEach(st => {
					st.isActive = true;
					st.save().catch(e => console.log(e));
				});

		}
		catch(e) {
			console.log(e);
		}
    }
}

