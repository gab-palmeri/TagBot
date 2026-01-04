###############
### GENERAL ###
###############
start = 
    Hi! I'm a [bot](https://t.me/tagbotchannel/3) that lets you create and manage *tags*.

    A *tag* is like an #hashtag: people can subscribe to it and get notified when it’s mentioned.
    Use tags to group people by topic, interest, or role.

    Type */help* to see the list of commands.

    _Remember to give me_ *administrator* _permissions so I can tag people in your group._


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

admin.no-groups = 
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
    .validation-not-found = ❌ Tag *{ $tagName }* not found
    .validation-already-exists = ❌ Tag *{ $tagName }* already exists
    .validation-empty-one = ⚠️ The tag { $tags } is *empty*
    .validation-empty-other = ⚠️ These tags are *empty*: { $tags }
    .validation-non-existent-one = ❌ The tag { $tags } *does not exist*
    .validation-non-existent-other = ❌ These tags *do not exist*: { $tags }
    .validation-only-one-one = ⚠️ You're the *only one* in the tag { $tags }
    .validation-only-one-other = ⚠️ You're the *only one* in these tags: { $tags }
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