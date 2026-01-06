###############
### GENERAL ###
###############
start = 
    Hi! I'm a <a href="https://t.me/tagbotchannel/3">bot</a> that lets you create and manage <b>tags</b>.

    A <b>tag</b> is like an #hashtag: people can subscribe to it and get notified when it’s mentioned.
    Use tags to group people by topic, interest, or role.

    Type <b>/help</b> to see the list of commands.

    <i>Remember to give me</i> <b>administrator</b> <i>permissions so I can see #tags.</i>


help =
    👇 <b>Here's the list of commands!</b>

    🔑 <b>Admin commands:</b>
    /create tagname → <i>Create a new tag</i>
    /delete tagname → <i>Delete a tag</i>
    /rename oldtagname newtagname → <i>Rename a tag</i>
    /restart → <i>Restart the bot</i>
    /settings → <i>Access tagbot settings</i>

    👤 <b>User commands:</b>
    #tagname → <i>Mention all the users subscribed to a tag</i>
    /join tagname → <i>Join a tag</i>
    /leave tagname → <i>Leave a tag</i>
    /list → <i>List all the tags</i>
    /mytags → <i>List all the tags you are subscribed to</i>

    <i>To report a bug, suggest a feature or get bot updates, join @tagbotchannel</i>


restart =
    .success = ✅ <b>Admin list</b> has been updated!
    .error = ❌ An error occurred while updating the <b>admin list</b>.

private-only =
    ✨ This command works only in <b>private chats</b>!

private-only-btn =
    👉 Tap here

internal-error =
    ⚠️ An internal error occurred. Please try again later.

#############
### ADMIN ###
#############

admin =
    .no-groups = 
        ⚠️ You are not an <b>admin</b> of any group.

        🛠️ <i>Can't see a group you're an admin of? 
        Send /restart there and retry</i>

permissions =
    .create-tags-admins = ❌ Only <b>admins</b> can <b>create</b> tags
    .delete-tags-admins = ❌ Only <b>admins</b> can delete tags
    .delete-tags-admins-or-creator = ❌ Only <b>admins</b> or the creator of this tag can <b>delete</b> it
    .rename-tags-admins = ❌ Only <b>admins</b> can rename tags
    .rename-tags-admins-or-creator = ❌ Only <b>admins</b> or the creator of this tag can <b>rename</b> it

####################
### GROUP EVENTS ###
####################

bot-rejoined = 
    It's good to be back! Type /help to see the list of commands.

    <i>Remember to give me <b>administrator</b> permissions so that I can answer to #tags.</i>
bot-join-error = ❌ An error occurred while setting up. Try adding me again.
bot-promoted = Now I'm fully operational!

migrate =
    .success = ✅ Your tags have been migrated to the supergroup chat!
    .error = ❌ An error occurred while migrating your group tags to the supergroup chat!

    

###########
### Tag ###
###########
tag =
    .create-ok = ✅ Created tag <b>{ $tagName }</b>
    .create-syntax = ⚠️ Syntax: /create <b>tagname</b>

    .delete-ok = ✅ Deleted tag <b>{ $tagName }</b>
    .delete-syntax = ⚠️ Syntax: /delete <b>tagname</b>

    .rename-ok = ✅ Renamed tag <b>{ $oldTagName }</b> to <b>{ $newTagName }</b>
    .rename-syntax = ⚠️ Syntax: /rename <b>oldtagname</b> <b>newtagname</b>

    .private-message = 
        🔔📩 You have been tagged in <b>{ $groupName }</b> 📩🔔
        🏷️ Tag: <b>{ $tagName }</b>
        👉 Click <a href="{ $messageLink }">here</a> to see the message
    .private-ok = ✅ Users in { $tagName } have been tagged privately. <a href="https://t.me/tagbotchannel/7">Why?</a>
    .private-error = ⚠️ These users didn't start the bot in private: { $notContacted }

    .validation-syntax = ⚠️ <b>Tags</b> must be between 3 and 32 characters long, and they should only contain letters, numbers, and underscores. Tags cannot start with an underscore
    .validation-already-exists = ❌ Tag <b>{ $tagName }</b> already exists
    
    .validation-not-found = { $count ->
        [one] ❌ Tag { $tagName } <b>not found</b>
        *[other] ❌ These tags <b>do not exist</b>: { $tagName }
    }
    .validation-not-found-callback = 
        ❌ Tag { $tagName } not found

    .validation-empty = { $count ->
        [one] ⚠️ Tag { $tagName } is <b>empty</b>
        *[other] ⚠️ These tags are <b>empty</b>: { $tagName }
    }

    .validation-only-one = { $count ->
        [one] ⚠️ You're the <b>only one</b> in the tag { $tagName }
        *[other] ⚠️ You're the <b>only one</b> in these tags: { $tagName }
    }
    .validation-flooding = 🕑 You can only mention <b>three tags</b> every <b>five minutes</b>. Slow down!


######################
### JOIN AND LEAVE ###
######################


join =
    .ok = @{ $username } joined tag { $tagName }. They will be notified when someone mentions it.
    .ok-callback = ✅ You have joined tag { $tagName }. You will be notified when someone mentions it.
    .btn = Join this tag
    .syntax = ⚠️ Syntax: /join <b>tagname</b>
    .start-bot-msg = ⚠️ To join <b>tags</b>, you need to start a <b>private chat</b> with the bot.
    .start-bot-btn = Start the bot!
    .start-bot-msg-callback = ⚠️ To join tags, you need to start a private chat with the bot.
    .already-subscribed = ⚠️ You are already subscribed to <b>{ $tagName }</b>
    .already-subscribed-callback = ⚠️ You are already subscribed to { $tagName }

leave =
    .ok = @{ $username } left tag <b>{ $tagName }</b>. They will no longer be notified when someone mentions it.
    .syntax = ⚠️ Syntax: /leave <b>tagname</b>
    .not-subscribed = ⚠️ You are <b>not subscribed</b> to tag { $tagName }
    

#################
### TAGS LIST ###
#################
list =
    .empty = ⚠️ No <b>tags</b> found in this group
    .full = 👇 <b>Here's a list of all the tags in { $groupName }:</b>
    .partial = 👇 <b>Here's a partial list of the tags in this group:</b>
    
    .main = 🔥 <b>Main tags:</b>
    .other = 📝 <b>Other tags:</b>

    .callback-success = ✅ I've sent you a private message with all the tags!
    .callback-error = ⚠️ I couldn't send you a private message. Please start a chat with me first

    .see-all-tags = 👉 See all tags

mytags =
    .header = 📄 <b>Here's a list of the tags you're in, @{ $username }:</b>
    .empty = ⚠️ You are not subscribed to any tags in this group, @{ $username }

tag-entry =
        - <code>{ $tagName }</code> <i>{ $count ->
            [one] 1 sub
        *[other] { $count } subs
        }</i>




################
### SETTINGS ###
################
settings =
    .main = 
        {"<b>🌟 TagBot Control Panel 🌟</b>"}
        👉🏻 <i>Select the group you want to manage and customize its settings.</i>

        🛠️ <i>Can't see a group you're an admin of?
        Send /restart there and retry</i>
    .group-panel = 🔑 <b>Group:</b> { $groupName }
    .create = ✏️ Create Tags
    .delete = 💣 Delete Tags
    .rename = ✍️ Rename Tags
    .language = 🌐 Language

    .create-description = 
        ✏️ <b>Who can create tags?</b>
        
        Decide who in this group has permission to create new tags. 
        Current setting: { $current }.

    .delete-description = 
        💣 <b>Who can delete tags?</b>
        
        Choose who is allowed to delete existing tags in this group. 
        Current setting: { $current }

    .rename-description = 
        ✍️ <b>Who can rename tags?</b>
        
        Set who can rename tags in the group. 
        Current setting: { $current }

    .language-group-description = 
        🌐 <b>Select bot language</b>
        
        Pick the language the bot will use to send messages in this group. 
        Current language: { $current }

    .language-private-description =
        🌐 <b>Select bot language</b>
        
        Pick the language the bot will use to send messages in this private chat. 
        Current language: { $current }

    .permissions-everyone = 🌍 Everyone
    .permissions-only-admins = 👑 Only admins
    .permissions-admins-creators = 🛠️ Tag creators & admins
    .back = 🔙 Go Back
    .close = ✖️ Close


#################
### LANGUAGES ###
#################
language =
    .it = Italian
    .en = English