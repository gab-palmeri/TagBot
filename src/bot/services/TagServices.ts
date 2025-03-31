import TagRepository from '../db/TagRepository';
import { GroupDTO } from '../dtos/GroupDTO';
import { TagDTO } from '../dtos/TagDTO';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default class TagServices {


	static async createTag(groupId: string, tagName: string, userId: string) {

		//create dtos and call repository
		const groupDTO = new GroupDTO(groupId, "");
		const tagDTO = new TagDTO(tagName, userId);

		return await TagRepository.createTag(groupDTO, tagDTO);
		
	}
	
	static async deleteTag(groupId: string, tagName: string) {
		
		const groupDTO = new GroupDTO(groupId, "");
		const tagDTO = new TagDTO(tagName);
		return await TagRepository.deleteTag(groupDTO, tagDTO);
	}
	
	static async renameTag(groupId: string, tagName: string, newTagName: string) {
	
		const groupDTO = new GroupDTO(groupId, "");
		const oldTagDTO = new TagDTO(tagName);
		const newTagDTO = new TagDTO(newTagName);

		return await TagRepository.renameTag(groupDTO, oldTagDTO, newTagDTO);
	}
	
    static async updateLastTagged(tagName: string, groupId: string) {

		const tagDTO = new TagDTO(tagName);
		const groupDTO = new GroupDTO(groupId, "");
		return await TagRepository.getTag(groupDTO, tagDTO);
    }

    static async getTag(groupId: string, tagName: string) {
	
		const groupDTO = new GroupDTO(groupId, "");
		const tagDTO = new TagDTO(tagName);
		return await TagRepository.getTag(groupDTO, tagDTO);
	}

    static async getTagSubscribers(tagName: string, groupId: string) {
		
		const groupDTO = new GroupDTO(groupId, "");
		const tagDTO = new TagDTO(tagName);
		return await TagRepository.getSubscribersByTag(tagDTO, groupDTO);
	}

    static async getTagsByGroup(groupId: string) {
	
		const groupDTO = new GroupDTO(groupId, "");
		return await TagRepository.getTagsByGroup(groupDTO);
	}
}