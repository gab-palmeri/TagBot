import { Tag } from "../../entity/Tag";

//SYNTAX MESSAGES
export const msgJoinSyntaxError = `⚠️ Syntax: /join tagname`;
export const msgLeaveSyntaxError = `⚠️ Syntax: /leave tagname`;
/* ******************************************* */


//JOIN/LEAVE MESSAGES
export function msgJoinPrivate(tagName: string) {
    return `You have joined the tag <b>${tagName}</b>. You will be notified when someone tags it.`
        + `\n\n<i>Keep the bot started to get tagged privately!</i>`;
}

export function msgJoinPublic(tagName: string, username: string) {
    return [
        `@${username} joined tag ${tagName}. They will be notified when someone tags it.`,
        `Join this tag`
    ];
}

export function msgJoinStartBot(tagName: string, username: string) {
    const message = `To join <b>tags</b>, @${username}, you need to start a <b>private chat</b> with the bot`;
    const inlineKeyboardMessage = `Click here to join tag ${tagName}!`;

    return [message, inlineKeyboardMessage];
}

export function msgLeaveTag(username: string, tagName: string) {
    return `@${username} left tag ${tagName}. They will no longer be notified when someone tags it.`;
}
/* ******************************************* */


//TAGS MESSAGES
export function msgPrivateTag(tagName: string, groupTitle: string, messageLink: string) {
    return `You have been tagged in <b>${groupTitle}</b> through the ${tagName} tag. Click <a href='${messageLink}'>here</a> to see the message`;
}

export function msgPrivateTagResponse(tagName: string) {
    return `✅ Users in ${tagName} have been tagged privately. <a href='https://t.me/tagbotchannel/7'>Why?</a>\n`;
}

export function msgPrivateTagError(notContacted: string) {
    return `⚠️ These users didn't start the bot in private: ${notContacted}`;
}

export function msgTagsErrors(emptyTags: string[], nonExistentTags: string[], onlyOneInTags: string[]) {
    let errorMessages = ``;

    switch (emptyTags.length) {
        case 0: break;
        case 1: errorMessages += `⚠️ The tag ${emptyTags[0]} is empty\n`; break;
        default: {
            const tags = emptyTags.join(`, `);
            errorMessages += `⚠️ These tags are empty: ${tags}\n`;
        }
            
    }

    switch (nonExistentTags.length) {
        case 0: break;
        case 1: errorMessages += `❌ The tag ${nonExistentTags[0]} does not exist\n`; break;
        default: {
            const tags = nonExistentTags.join(`, `);
            errorMessages += `❌ These tags do not exist: ${tags}\n`;
        }
    }

    switch (onlyOneInTags.length) {
        case 0: break;
        case 1: errorMessages += `⚠️ You're the only one in the tag ${onlyOneInTags[0]}\n`; break;
        default: {
            const tags = onlyOneInTags.join(`, `);
            errorMessages += `⚠️ You're the only one in these tags: ${tags}\n`;
        }
    }

    return errorMessages;
}

export const msgFloodingError = `🕑 You can only mention three tags every five minutes. Slow down!`;
/* ******************************************* */


//MISC MESSAGES
export function msgListTags(mainTags: Tag[], otherTags: Tag[] = null) {

    let message = "<b>📄 Here's a list of all the tags in this group:</b>\n\n";

    if(otherTags != null)
        message +=  "<b>Main tags:</b>\n";

    message += mainTags.map((tag) => {
        if(tag.subscribersTags.length == 1)
            return `- ` + tag.name + ` <i>(1 sub)</i>`;
        else
            return `- ` + tag.name + ` <i>(` + tag.subscribersTags.length + ` subs)</i>`;
    }).join(`\n`);


    if(otherTags != null) {
        message += `\n\n <b>Other tags:</b>\n`;

        message += otherTags.map((tag) => {
            if(tag.subscribersTags.length == 1)
                return `- ` + tag.name + ` <i>(1 sub)</i>`;
            else
                return `- ` + tag.name + ` <i>(` + tag.subscribersTags.length + ` subs)</i>`;
        }).join(`\n`);
    }

    return message;    
}

export function msgMyTags(tags: Tag[], username: string) {
    return `📄 <b>Here's a list of the tags you're in, @${username}:</b>\n\n${tags.map((tag) => {
        return `- ` + tag.name;
    }).join(`\n`)}`;
}
/* ******************************************* */




