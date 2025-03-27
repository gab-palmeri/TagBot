import { Group } from '../../entity/Group';
import { Tag } from '../../entity/Tag';


export default class AdminServices {
	static async createTag(groupId: number, tagName: string, userId: number) {

		try {
			//get the group from the database using ctx.update.message.chat.id
			const group = await Group.findOne({where: {groupId: groupId}});

			if (!group) {
				return { state: 'error', message: "This group has not been registered by the bot. Please re-add the bot to the group" };
			}
	
			let tag = new Tag();
			tag.name = tagName.toLowerCase();
			tag.group = group;
			tag.creatorId = userId;
			tag = await tag.save();
			return { state: 'ok', message: null };
	
		}
		catch(error) {
			const response =
				error.code == '23505'
					? { state: 'error', message: 'This tag already exists' }
					: { state: 'error', message: 'An error occured' };
			return response;
		}
		
	}
	
	static async deleteTag(groupId: number, tagName: string) {
		
		try {
			//get the tag from the database
			const tag = await Tag.findOne({where: {name: tagName, group: {groupId: groupId}}});
	
			//if the tag doesn't exist, return an error
			if(!tag) {
				return {state: "error", message: "This tag doesn't exist"};
			}
	
			//delete the tag
			await tag.remove();
			return {state: "ok", message: null};
		}
		catch(error) {
			console.log(error);
			return {state: "error", message: "An error occured"};
		}
	}
	
	static async renameTag(groupId: number, tagName: string, newTagName: string) {
	
		try {
			//get the tag from the database
			const tag = await Tag.findOne({where: {name: tagName, group: {groupId: groupId}}});
	
			//if the tag doesn't exist, return an error
			if(!tag) {
				return {state: "error", message: "This tag doesn't exist"};
			}
	
			//rename the tag
			tag.name = newTagName;
			await tag.save();
			return {state: "ok", message: null};
		}
		catch(error) {
			if(error.code == "23505")
				return {state: "error", message:"A tag with this name already exists"};

			return {state: "error", message: "An error occured"};
		}
	}
	
	static async getAdminGroups(userId: number) {
		try {
			const groups = await Group.find({ relations: ["admins"], where: { admins: {userId: userId} } });
	
			return {state: "ok", payload: groups};
		}
		catch(error) {
			console.log(error);
			return {state: "error", message: "An error occured"};
		}
	}
	
	static async editGroupPermissions(groupId: number, userId: number, permissions: object) {
		try {
	
			//select the group from the database
			const group = await Group.findOne({relations: ["admins"], where: {groupId: groupId}});
	
			if(!group) {
				return {state: "NOT_EXIST", message: "This group doesn't exist"};
			}
	
			//check if the user is an admin of the group
			const isAdmin = group.admins.find(admin => admin.userId == userId);
			if(!isAdmin) {
				return {state: "NOT_ADMIN", message: "You are not an admin of this group"};
			}
	
			//iterate through permissions, get key name and value
			for (const [key, value] of Object.entries(permissions)) {
				//set the permission
				key in group && (group[key] = value);
			}
	
			await group.save();
	
			return {state: "ok", message: null};
		}
		catch(error) {
			console.log(error);
			return {state: "error", message: "An error occured"};
		}
	}
}

