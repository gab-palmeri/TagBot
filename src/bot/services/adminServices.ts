import { Group } from '../../entity/Group';
import { Tag } from '../../entity/Tag';
import { Subscriber } from '../../entity/Subscriber';

export async function createTag(groupId: number, tagName: string) {

	try {
		//get the group from the database using ctx.update.message.chat.id
		let group = await Group.findOne({where: {groupId: groupId}}); 

		//if the group doesn't exist, create it
		if(!group) {
			group = new Group();
			group.groupId = groupId;
			group = await group.save();
		}

		let tag = new Tag();
        tag.name = tagName;
        tag.group = group;
        tag = await tag.save();
        return { state: 'ok', message: null };

	}
	catch(error) {
		const response =
            error.code == 'ER_DUP_ENTRY'
                ? { state: 'error', message: 'This tag already exists' }
                : { state: 'error', message: 'An error occured' };
        return response;
	}
	
}

export async function deleteTag(groupId: number, tagName: string) {
	
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

export async function addSubscribersToTag(groupId: number, tagName: string, usernames: string[]) {
	
	const tag = await Tag.findOne({ where: { name: tagName }, relations: ['group'] });

    if (!tag || tag.group.groupId != groupId) {
        return { state: 'error', message: "This tag doesn't exist" };
    }

	//for each userId, add the subscriber to the tag. if the subscriber doesn't exist, create it

	usernames.forEach(async username => {
		let subscriber = await Subscriber.findOne({ where: { username: username }, relations: ['tags'] });

        if (!subscriber) {
            subscriber = new Subscriber();
            subscriber.username = username;
            subscriber.tags = [tag];
            subscriber = await subscriber.save();
        } else {
            subscriber.tags.push(tag);
            await subscriber.save();
        }

	});

	return { state: 'ok', message: null };

}