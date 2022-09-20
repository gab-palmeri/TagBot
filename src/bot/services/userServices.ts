import { Group } from '../../entity/Group';
import { Tag } from '../../entity/Tag';
import { Subscriber } from '../../entity/Subscriber';

//TODO
//USARE LA FUNZIONE GET TAG IN TUTTI GLI ALTRI METODI


export async function joinTag(groupId: number, tagName: string, username: string) {

	const tagResponse = await getTag(groupId, tagName); 

	if(tagResponse.state != "ok") {
		return tagResponse;
	}

	const tag = tagResponse.payload;

	//add the tag to the subscriber
	let subscriber = await Subscriber.findOne({where: {username: username}, relations: ["tags"]});

	if(!subscriber) {
		subscriber = new Subscriber();
		subscriber.username = username;
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

export async function leaveTag(groupId: number, tagName: string, username: string) {
	const tagResponse = await getTag(groupId, tagName);

    if (tagResponse.state != 'ok') {
        return tagResponse;
    }

    const tag = tagResponse.payload;

	//remove the tag from the subscriber
	const subscriber = await Subscriber.findOne({relations: ["tags"], where: {username: username}, });

	if(!subscriber || !subscriber.tags.find(n => n.id == tag.id)) {
		return {state: "NOT_SUBSCRIBED", message: "You're not subscribed to this tag"};
	}
	else {
		subscriber.tags = subscriber.tags.filter(n => n.id != tag.id);
		await subscriber.save();
	}

	return {state: "ok", message: null};
}

export async function getSubscribers(tagName: string, groupId: number) {
	
	try {
		//get tag belonging to the group
		const tag = await Tag.findOne({relations: ["group", "subscribers"], where: { name: tagName, group: {groupId: groupId}}});

		if(!tag) 
			return {state: "error", message: "This tag doesn't exist"};

		if(tag.subscribers.length == 0)
			return {state: "error", message: "No one is subscribed to this tag"};

		return {state: "ok", payload: tag.subscribers.map(s => s.username)};
	}
	catch(e) {
		console.log(e);
		return {state: "error", message: "Service not available"};
	}
}

export async function getGroupTags(groupId: number) {

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

export async function getSubscriberTags(username: string, groupId: number) {

	try {

		//find all tags belonging to the group and the subscriber
		const tags = await Tag.find({relations: ["group", "subscribers"], where: {group: {groupId: groupId}, subscribers: {username: username}}});

		if (!tags || tags.length == 0) {
            return { state: 'error', message: "You are not subscribed to any tag" };
        } else return { state: 'ok', payload: tags };
	}
	catch(e) {
		console.log(e);
		return {state: "error", message: "Service not available"};
	}
}

export async function getTag(groupId: number, tagName: string) {

	try {
		const tag = await Tag.findOne({where: {name: tagName, group: {groupId: groupId}}, relations: ["group"]});

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