//SYNTAX ERROR MESSAGES
export const msgCreateSyntaxError = `⚠️ Syntax: /create tagname`;
export const msgDeleteSyntaxError = `⚠️ Syntax: /delete tagname`;
export const msgRenameSyntaxError = `⚠️ Syntax: /rename oldtagname newtagname`;
/* ******************************************* */


export function msgTagSyntaxError(issuerUsername: string) {
    return `⚠️ Tags must be between 3 and 32 characters long, and they should only contain letters, numbers, and underscores. Tags cannot start with an underscore (_). (@${issuerUsername})`;
}

export function msgCreateTag(tagName: string, issuerUsername: string) {
    return `✅ Created tag ${tagName} (@${issuerUsername})`;
}

export function msgDeleteTag(tagName: string, issuerUsername: string) {
    return `✅ Deleted tag ${tagName} (@${issuerUsername})`;
}

export function msgRenameTag(oldTagName: string,newTagName: string,issuerUsername: string) {
    return `✅ Renamed tag <b>${oldTagName}</b> to <b>${newTagName}</b> (@${issuerUsername})`;
}
