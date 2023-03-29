//SYNTAX ERROR MESSAGES
export const msgCreateSyntaxError = `⚠️ Syntax: /create tagname`;
export const msgDeleteSyntaxError = `⚠️ Syntax: /delete tagname`;
export const msgRenameSyntaxError = `⚠️ Syntax: /rename oldtagname newtagname`;
/* ******************************************* */


//ADMIN COMMANDS
export function msgCreateTagError(issuerUsername: string) {
    return `⚠️ Tag must be at least 3 characters long, can contain only letters, numbers and underscores and it can't start with _ (@${issuerUsername})`;
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

export function msgRenameTagError(issuerUsername: string) {
    return `⚠️ Tags must be at least 3 characters long, can contain only letters, numbers and underscores and it can't start with _ (@${issuerUsername})`;
}
/* ******************************************* */
