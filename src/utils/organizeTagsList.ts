import GroupRepository from "@db/group/group.repository";
import TagRepository from "@db/tag/tag.repository";

import { TagDTO } from "../db/tag/tag.dto";

//TODO: better typing of the response
export async function organizeTagsList(groupId: string, limitNextTags = true){

    const tagRepository = new TagRepository();
    const groupRepository = new GroupRepository();

    const group = await groupRepository.getGroup(groupId);

    const getTagsByGroupResult = await tagRepository.getByGroup(group.id);

    const tags = getTagsByGroupResult;
    const maxActiveTags = 5;
    const maxNextTags = limitNextTags ? 5 : tags.length - maxActiveTags;
    
    // If there are more than 5 tags, sort them by score
    if(tags.length > maxActiveTags) {
        //Calculate the maximum number of subscribers among all the tags
        const maxSubscribers = tags.reduce((max, tag) => tag.subscribersNum > max ? tag.subscribersNum : max, 0);

        //Calculate the score for each tag
        const tagsWithScores = tags.map(tag => {
            //1) Score based on the number of subscribers: the more subscribers, the higher the score
            const subscribersScore = tag.subscribersNum / maxSubscribers;

            //2) Score based on the last time the tag was used: the more recent, the higher the score
            //   Calculate the distance between today and tagLastTagged in days    
            const tagLastTagged = new Date(tag.lastTagged);
            const diffTime = Math.abs(new Date().getTime() - tagLastTagged.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const dateScore = 1 / diffDays;

            return { tag, score: subscribersScore + dateScore };
        });

        // Sort the tags by score
        const tagsByScore = tagsWithScores.sort((a,b) => b.score - a.score).map(tag => tag.tag);

        // Take the first 5 tags with the highest score, and then all the others
        const mostActiveTags = tagsByScore.slice(0, maxActiveTags)
                                            .sort((a,b) => a.name.localeCompare(b.name))
                                            .map(tag => new TagDTO(tag.name, tag.creatorId, tag.lastTagged, tag.subscribersNum));
        const nextTags = tagsByScore.slice(maxActiveTags, maxActiveTags + maxNextTags)
                                    .sort((a,b) => a.name.localeCompare(b.name))
                                    .map(tag => new TagDTO(tag.name, tag.creatorId, tag.lastTagged, tag.subscribersNum));

        return {
            "mainTags": mostActiveTags,
            "secondaryTags": nextTags
        };
        

    }
    else {
        // If there are less than 5 tags, sort them alphabetically and send them
        const tagsByName = tags.sort((a,b) => a.name.localeCompare(b.name));
        return {
            "mainTags": tagsByName,
            "secondaryTags": null
        };
    }
}