import SubscriberRepository from '@repository/SubscriberRepository';
import { GroupDTO } from '@dto/GroupDTO';
import { SubscriberDTO } from '@dto/SubscriberDTO';
import { TagDTO } from '@dto/TagDTO';

export default class SubscriberServices {
   
	static async joinTag(groupId: string, tagName: string, userId: string) {

		const groupDTO = new GroupDTO(groupId, "");
		const tagDTO = new TagDTO(tagName);
		const subscriberDTO = new SubscriberDTO(userId, "");

		return await SubscriberRepository.joinTag(groupDTO, tagDTO, subscriberDTO);
	}
	
	static async leaveTag(groupId: string, tagName: string, userId: string) {
		const groupDTO = new GroupDTO(groupId, "");
		const tagDTO = new TagDTO(tagName);
		const subscriberDTO = new SubscriberDTO(userId, "");

		return await SubscriberRepository.leaveTag(groupDTO, tagDTO, subscriberDTO);
		
	}
	
	static async getSubscriberTags(userId: string, groupId: string) {
	
		const groupDTO = new GroupDTO(groupId, "");
		const subscriberDTO = new SubscriberDTO(userId, "");

		return await SubscriberRepository.getSubscriberTags(subscriberDTO, groupDTO);
	}

	static async getSubscriber(userId: string) {
		const subscriberDTO = new SubscriberDTO(userId, "");
		return await SubscriberRepository.getSubscriber(subscriberDTO);
	}

	static async updateSubscriberUsername(userId: string, username: string) {
		const subscriberDTO = new SubscriberDTO(userId, username);
		return await SubscriberRepository.updateSubscriberUsername(subscriberDTO);
	}

	static async setInactive(groupId: string, userId: number) {
		const groupDTO = new GroupDTO(groupId, "");
		const subscriberDTO = new SubscriberDTO(userId.toString(), "");
		return await SubscriberRepository.setInactive(groupDTO, subscriberDTO);
    }

	static async setActive(groupId: string, userId: number) {
		const groupDTO = new GroupDTO(groupId, "");
		const subscriberDTO = new SubscriberDTO(userId.toString(), "");
		return await SubscriberRepository.setActive(groupDTO, subscriberDTO);
    }
}

