//BOT STATIC COMMANDS
export const startMessage = "Hi! I'm a <a href='https://t.me/tagbotchannel/3'>bot</a> that allows you to <b>create</b> and <b>manage</b> grouptags." +
" Type <b>/help</b> to see the <b>list of commands.</b>\n\n" +
"<i>Remember to give me <b>administrator</b> permissions so that I can answer to #tags.</i>\n\n" +
"<i>To report a bug, suggest a feature or get bot updates, join @tagbotchannel</i>";

export const helpMessage = "👇 <b>Here's the list of commands!</b>\n\n" +
"🔑 <b>Admin commands:</b>\n" +
    '/create tagname -> <i>Create a new tag</i>\n' +
    '/delete tagname -> <i>Delete a tag</i>\n' +
    '/rename oldtagname newtagname -> <i>Rename a tag</i>\n' +
	'/settings -> <i>Access tagbot settings</i>\n\n' +
'👤 <b>User commands:</b>\n' +
    '#tagname -> <i>Mention all the users subscribed to a tag</i>\n' +
    '/join tagname -> <i>Join a tag</i>\n' +
    '/leave tagname -> <i>Leave a tag</i>\n' +
    '/list -> <i>List all the tags</i>\n' +
    '/mytags -> <i>List all the tags you are subscribed to</i>\n\n' +
'<i>To report a bug, suggest a feature or get bot updates, join @tagbotchannel</i>';


export const restartSuccessMessage = "✅ Admin list updated!";
export const restartErrorMessage = "❌ An error occurred while updating the admin list.";
/* ******************************************* */


//GROUP EVENTS
export const botRejoinedMessage = "It's good to be back! Type /help to see the list of commands.\n\n" + 
"<i>Remember to give me <b>administrator</b> permissions so that I can answer to #tags.</i>";
export const botJoinErrorMessage = "❌ An error occurred while setting up. Try adding me again.";
export const botPromotedMessage = "Now i'm fully operational!";
export const migrateSuccessMessage = "✅ Your group tags have been migrated to the supergroup chat!";
export const migrateErrorMessage = "❌ An error occurred while migrating your group tags to the supergroup chat!";
/* ******************************************* */
