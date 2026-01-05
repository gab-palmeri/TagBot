###############
### GENERAL ###
###############
start = 
    Hi! I'm a [bot](https://t.me/tagbotchannel/3) that lets you create and manage *tags*.

    A *tag* is like an #hashtag: people can subscribe to it and get notified when it’s mentioned.
    Use tags to group people by topic, interest, or role.

    Type */help* to see the list of commands.

    _Remember to give me_ *administrator* _permissions so I can see #tags._


help =
    👇 *Here's the list of commands!*

    🔑 *Admin commands:*
    /create tagname → _Create a new tag_
    /delete tagname → _Delete a tag_
    /rename oldtagname newtagname → _Rename a tag_
    /settings → _Access tagbot settings_

    👤 *User commands:*
    #tagname → _Mention all the users subscribed to a tag_
    /join tagname → _Join a tag_
    /leave tagname → _Leave a tag_
    /list → _List all the tags_
    /mytags → _List all the tags you are subscribed to_

    _To report a bug, suggest a feature or get bot updates, join @tagbotchannel_


restart =
    .success = ✅ *Admin list* has been updated!
    .error = ❌ An error occurred while updating the *admin list*.

private-only =
    ✨ This command works only in *private chats*!

private-only-btn =
    👉 Tap here

internal-error =
    ⚠️ An internal error occurred. Please try again later.

#############
### ADMIN ###
#############

admin =
    .no-groups = 
        ⚠️ You are not an *admin* of any group.

permissions =
    .create-tags-admins = ❌ Only *admins* can *create* tags
    .delete-tags-admins = ❌ Only *admins* can delete tags
    .delete-tags-admins-or-creator = ❌ Only *admins* or the creator of this tag can *delete* it
    .rename-tags-admins = ❌ Only *admins* can rename tags
    .rename-tags-admins-or-creator = ❌ Only *admins* or the creator of this tag can *rename* it

####################
### GROUP EVENTS ###
####################

bot-rejoined = 
    It's good to be back! Type /help to see the list of commands.

    _Remember to give me *administrator* permissions so that I can answer to #tags._
bot-join-error = ❌ An error occurred while setting up. Try adding me again.
bot-promoted = Now I'm fully operational!

migrate =
    .success = ✅ Your tags have been migrated to the supergroup chat!
    .error = ❌ An error occurred while migrating your group tags to the supergroup chat!

    

###########
### Tag ###
###########
tag =
    .create-ok = ✅ Created tag *{ $tagName }*
    .create-syntax = ⚠️ Syntax: /create *tagname*

    .delete-ok = ✅ Deleted tag *{ $tagName }*
    .delete-syntax = ⚠️ Syntax: /delete *tagname*

    .rename-ok = ✅ Renamed tag *{ $oldTagName }* to *{ $newTagName }*
    .rename-syntax = ⚠️ Syntax: /rename *oldtagname* *newtagname*

    .private-message = 
        🔔📩 You have been tagged in *{ $groupName }* 📩🔔
        🏷️ Tag: *{ $tagName }*
        👉 Click [here]({ $messageLink }) to see the message
    .private-ok = ✅ Users in { $tagName } have been tagged privately. [Why?](https://t.me/tagbotchannel/7)
    .private-error = ⚠️ These users didn't start the bot in private: { $notContacted }

    .validation-syntax = ⚠️ *Tags* must be between 3 and 32 characters long, and they should only contain letters, numbers, and underscores. Tags cannot start with an underscore
    .validation-already-exists = ❌ Tag *{ $tagName }* already exists
    
    .validation-not-found = { $count ->
        [one] ❌ Tag { $tagName } *not found*
        *[other] ❌ These tags *do not exist*: { $tagName }
    }

    .validation-empty = { $count ->
        [one] ⚠️ Tag { $tagName } is *empty*
        *[other] ⚠️ These tags are *empty*: { $tagName }
    }

    .validation-only-one = { $count ->
        [one] ⚠️ You're the *only one* in the tag { $tagName }
        *[other] ⚠️ You're the *only one* in these tags: { $tagName }
    }
    .validation-flooding = 🕑 You can only mention *three tags* every *five minutes*. Slow down!


######################
### JOIN AND LEAVE ###
######################


join =
    .ok = @{ $username } joined tag { $tagName }. They will be notified when someone mentions it.
    .btn = Join this tag
    .syntax = ⚠️ Syntax: /join *tagname*
    .start-bot-msg = To join *tags*, you need to start a *private chat* with the bot.
    .start-bot-btn = Start the bot!
    .already-subscribed = ⚠️ You are already subscribed to *{ $tagName }*

leave =
    .ok = @{ $username } left tag { $tagName }. They will no longer be notified when someone mentions it.
    .syntax = ⚠️ Syntax: /leave *tagname*
    .not-subscribed = ⚠️ You are *not subscribed* to tag { $tagName }
    

#################
### TAGS LIST ###
#################
list =
    .empty = ⚠️ No *tags* found in this group
    .full = 👇 *Here's a list of all the tags in { $groupName }:*
    .partial = 👇 *Here's a partial list of the tags in this group:*
    
    .main = 🔥 *Main tags:*
    .other = 📝 *Other tags:*

    .callback-success = ✅ I've sent you a private message with all the tags!
    .callback-error = ⚠️ I couldn't send you a private message. Please start a chat with me first

mytags =
    .header = 📄 *Here's a list of the tags you're in, @{ $username }:*
    .empty = ⚠️ You are not subscribed to any tags in this group, @{ $username }

tag-entry =
        - `{ $tagName }` _{ $count ->
            [one] 1 sub
        *[other] { $count } subs
        }_




################
### SETTINGS ###
################
settings =
    .main = 
        {"*🌟 TagBot Control Panel 🌟*"}
        
        👉🏻  _*Select the group* you want to manage and customize its settings._
    .group-panel = 🔑 *Group:* { $groupName }
    .create = ✏️ Create Tags
    .delete = 💣 Delete Tags
    .rename = ✍️ Rename Tags
    .language = 🌐 Language

    .create-description = 
        ✏️ *Who can create tags?*
        
        Decide who in this group has permission to create new tags. 
        Current setting: { $current }.

    .delete-description = 
        💣 *Who can delete tags?*
        
        Choose who is allowed to delete existing tags in this group. 
        Current setting: { $current }

    .rename-description = 
        ✍️ *Who can rename tags?*
        
        Set who can rename tags in the group. 
        Current setting: { $current }

    .language-group-description = 
        🌐 Select bot language
        
        Pick the language the bot will use to send messages in this group. 
        Current language: { $current }

    .language-private-description =
        🌐 Select bot language
        
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