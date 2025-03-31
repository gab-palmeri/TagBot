import { Tag } from '../../entity/Tag';
import { Subscriber } from '../../entity/Subscriber';
import { SubscriberTag } from '../../entity/SubscriberTag';
import { Result } from '../utils/Result';
import { SubscriberDTO } from '../dtos/SubscriberDTO';
import { GroupDTO } from '../dtos/GroupDTO';
import { TagDTO } from '../dtos/TagDTO';

export default class SubscriberRepository {
   
    static async joinTag(groupDTO: GroupDTO, tagDTO: TagDTO, subscriberDTO: SubscriberDTO) {
        
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
            
        try {
            let subscriber = await Subscriber.findOne({
                where: { userId: subscriberDTO.userId.toString() },
                relations: ["subscribersTags", "subscribersTags.tag"]
            });
    
            if(!subscriber) {
                subscriber = new Subscriber();
                subscriber.userId = subscriberDTO.userId.toString();
                subscriber.username = subscriberDTO.username;

                const subscribersTags = new SubscriberTag();
                subscribersTags.subscriber = subscriber;
                subscribersTags.tag = tag;
                subscriber.subscribersTags = [subscribersTags];

                subscriber = await subscriber.save();
            }
            else {
                if(subscriber.subscribersTags.find(n => n.tag.id == tag.id))
                    return Result.failure(new Error("Already subscribed to this tag"));
    
                const subscribersTags = new SubscriberTag();
                subscribersTags.subscriber = subscriber;
                subscribersTags.tag = tag;

                subscriber.subscribersTags.push(subscribersTags);
                await subscriber.save();
            }
    
            return Result.success();
        }
        catch(err) {
            console.log(err);
            return Result.failure(new Error("Subscription failed"));
        }
    }
    
    static async leaveTag(groupDTO: GroupDTO, tagDTO: TagDTO, subscriberDTO: SubscriberDTO) {
        
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
    
        try {
            const subscriber = await Subscriber.findOne({
                relations: ["subscribersTags", "subscribersTags.tag"], 
                where: { userId: subscriberDTO.userId.toString() }
            });
    
            if(!subscriber?.subscribersTags.find(n => n.tag.id == tag.id)) {
                return Result.failure(new Error("Not subscribed to this tag"));
            }

            await subscriber.subscribersTags.find(n => n.tag.id == tag.id).remove();
            subscriber.subscribersTags = subscriber.subscribersTags.filter(n => n.tag.id != tag.id);
            await subscriber.save();
    
            return Result.success();
        }
        catch(err) {
            console.log(err);
            return Result.failure(new Error("Unsubscription failed"));
        }
    }
    
    static async getSubscriberTags(subscriberDTO: SubscriberDTO, groupDTO: GroupDTO) {
        try {
            const tags = await Tag.find({
                relations: ["group", "subscribersTags", "subscribersTags.subscriber"], 
                where: {
                    group: { groupId: groupDTO.groupId },
                    subscribersTags: { subscriber: { userId: subscriberDTO.userId.toString() } }
                }
            });
    
            if(!tags || tags.length == 0) {
                return Result.failure(new Error("No subscribed tags found"));
            } 
            
            return Result.success(tags.map(tag => new TagDTO(
                tag.name,
                tag.creatorId,
                tag.lastTagged
            )));
        }
        catch(e) {
            console.log(e);
            return Result.failure(new Error("Failed to get tags"));
        }
    }
    
    static async getSubscriber(subscriberDTO: SubscriberDTO) {
        try {
            const subscriber = await Subscriber.findOne({
                where: { userId: subscriberDTO.userId.toString() }
            });
    
            if(!subscriber) {
                return Result.failure(new Error("Subscriber not found"));
            }
            
            return Result.success(new SubscriberDTO(
                subscriber.userId,
                subscriber.username
            ));
        }
        catch(e) {
            console.log(e);
            return Result.failure(new Error("Failed to get subscriber"));
        }
    }

    static async updateSubscriberUsername(subscriberDTO: SubscriberDTO) {
        try {
            const subscriber = await Subscriber.findOne({
                where: { userId: subscriberDTO.userId.toString() }
            });
    
            if(!subscriber) {
                return Result.failure(new Error("Subscriber not found"));
            }
            
            subscriber.username = subscriberDTO.username;
            await subscriber.save();
            
            return Result.success(new SubscriberDTO(
                subscriber.userId,
                subscriber.username
            ));
        }
        catch(e) {
            console.log(e);
            return Result.failure(new Error("Failed to update username"));
        }
    }

    static async setInactive(groupDTO: GroupDTO, subscriberDTO: SubscriberDTO) {
        try {
            const subscriberTags = await SubscriberTag.find({
                relations: ["subscriber", "tag"], 
                where: {
                    subscriber: { userId: subscriberDTO.userId.toString() },
                    tag: { group: { groupId: groupDTO.groupId } }
                }
            });

            if(subscriberTags?.length > 0) {
                await Promise.all(subscriberTags.map(st => {
                    st.isActive = false;
                    return st.save();
                }));
            }

            return Result.success();
        }
        catch(e) {
            console.log(e);
            return Result.failure(new Error("Failed to deactivate subscriptions"));
        }
    }

    static async setActive(groupDTO: GroupDTO, subscriberDTO: SubscriberDTO) {
        try {
            const subscriberTags = await SubscriberTag.find({
                relations: ["subscriber", "tag"], 
                where: {
                    subscriber: { userId: subscriberDTO.userId.toString() },
                    tag: { group: { groupId: groupDTO.groupId } }
                }
            });

            if(subscriberTags?.length > 0) {
                await Promise.all(subscriberTags.map(st => {
                    st.isActive = true;
                    return st.save();
                }));
            }

            return Result.success();
        }
        catch(e) {
            console.log(e);
            return Result.failure(new Error("Failed to activate subscriptions"));
        }
    }
}