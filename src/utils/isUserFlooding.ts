import { LastUsedTags } from "utils/customTypes";

export async function isUserFlooding(userId: string, lastUsedTags: LastUsedTags) {
    
    const now = new Date().getTime();

    //lastUsedTags entries contain: userId, list of last three timestamps
    const userTimestamps = lastUsedTags.find(usedTag => usedTag.userId == userId);

    //If the user has never used a tag, add an entry to the array
    if(userTimestamps === undefined) {
        lastUsedTags.push({ userId, timestamps: [now] });
        return false;
    }
    else {

        //Else, if the user has used less than three tags, just push the current timestamp
        if(userTimestamps.timestamps.length < 3) {
            userTimestamps.timestamps.push(now);
            return false;
        }
        else {
            //Else, find the first timestamp before 5 minutes ago and get its index
            const timestampIndex = userTimestamps.timestamps.findIndex(timestamp => timestamp < now - 300000);

            //If there isn't one, return an error message; else swap the timestamp with the current one
            if(timestampIndex === -1) {
                return true;
            }
            else {
                userTimestamps.timestamps[timestampIndex] = now;
                return false;
            }
        }
    }
}
