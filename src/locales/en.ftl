###############
### GENERAL ###
###############
start = 
    Hi! I'm a [bot](https://t.me/tagbotchannel/3) that allows you to *create* and *manage* grouptags.
    Type */help* to see the *list of commands.*

    _Remember to give me *administrator* permissions so that I can answer to #tags._

    _To report a bug, suggest a feature or get bot updates, join @tagbotchannel_


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


restart-success =
    ✅ *Admin list* has been updated!

restart-error =
    ❌ An error occurred while updating the *admin list*.

group-not-found =
    Group not found

private-only =
    ✨ This command works only in *private chats*!

private-only-button =
    👉 Tap here

#############
### ADMIN ###
#############

admin-no-groups = 
    ⚠️ You are not an *admin* of any group.

only-admins-create-tags =
    ❌ Only *admins* can *create* tags

only-admins-or-creator-delete =
    ❌ Only *admins* or the creator of this tag can *delete* it

only-admins-delete =
    ❌ Only *admins* can delete tags

only-admins-or-creator-rename =
    ❌ Only *admins* or the creator of this tag can *rename* it

only-admins-rename =
    ❌ Only *admins* can rename tags

####################
### GROUP EVENTS ###
####################

bot-rejoined =
    It's good to be back! Type /help to see the list of commands.

    _Remember to give me *administrator* permissions so that I can answer to #tags._

bot-join-error =
    ❌ An error occurred while setting up. Try adding me again.

bot-promoted =
    Now I'm fully operational!

migrate-success =
    ✅ Your tags have been migrated to the supergroup chat!

migrate-error =
    ❌ An error occurred while migrating your group tags to the supergroup chat!


###################################
### TAGS CREATE, DELETE, RENAME ###
###################################

create-syntax-error =
    ⚠️ Syntax: /create *tagname*

delete-syntax-error =
    ⚠️ Syntax: /delete *tagname*

rename-syntax-error =
    ⚠️ Syntax: /rename *oldtagname* *newtagname*

tag-syntax-error =
    ⚠️ *Tags* must be between 3 and 32 characters long, and they should only contain letters, numbers, and underscores.
    Tags cannot start with an underscore

tag-not-found =
    ❌ Tag *{ $tagName }* not found

tag-already-exists = 
    ❌ Tag *{ $tagName }* already exists

tag-created =
    ✅ Created tag *{ $tagName }*

tag-deleted =
    ✅ Deleted tag *{ $tagName }*

tag-renamed =
    ✅ Renamed tag *{ $oldTagName }* to *{ $newTagName }*

######################
### JOIN AND LEAVE ###
######################

# Syntax errors
join-syntax-error =
    ⚠️ Syntax: /join *tagname*

leave-syntax-error =
    ⚠️ Syntax: /leave *tagname*


### Join ###
join-private =
    You have joined the tag *{ $tagName }*. You will be notified when someone tags it.

    _Keep the bot started to get tagged privately!_

join-public =
    @{ $username } joined tag { $tagName }. They will be notified when someone tags it.

join-public-inline-button =
    Join this tag

join-start-bot =
    To join *tags*, you need to start a *private chat* with the bot

join-start-bot-button =
    Start the bot!

already-subscribed-error =
    ⚠️ You are already subscribed to *{ $tagName }*

### Leave ###
leave-tag =
    @{ $username } left tag { $tagName }. They will no longer be notified when someone tags it.

not-subscribed-error =
    ⚠️ You are *not subscribed* to tag { $tagName }


##################
### USING TAGS ###
##################

private-tag =
    You have been tagged in *{ $groupTitle }* through the { $tagName } tag.
    Click [here]({ $messageLink }) to see the message

private-tag-response =
    ✅ Users in { $tagName } have been tagged privately.
    [Why?](https://t.me/tagbotchannel/7)

private-tag-error =
    ⚠️ These users didn't start the bot in private: { $notContacted }

empty-tags =
    ⚠️ { $count ->
        [one] The tag { $tags } is *empty*
       *[other] These tags are *empty*: { $tags }
    }

non-existent-tags =
    ❌ { $count ->
        [one] The tag { $tags } *does not exist*
       *[other] These tags *do not exist*: { $tags }
    }

only-one-in-tags =
    ⚠️ { $count ->
        [one] You're the *only one* in the tag { $tags }
       *[other] You're the *only one* in these tags: { $tags }
    }

flooding-error =
    🕑 You can only mention *three tags* every *five minutes*. Slow down!

#################
### TAGS LIST ###
#################

list-tags-empty =
    ⚠️ No *tags* found in this group

list-tags-full =
    👇 *Here's a list of all the tags in { $groupName }:*

list-tags-partial =
    👇 *Here's a partial list of the tags in this group:*

list-main-tags-header =
    🔥 *Main tags:*

list-other-tags-header =
    📝 *Other tags:*

tag-entry =
    - `{ $tagName }` _{ $count ->
        [one] 1 sub
       *[other] { $count } subs
    }_

list-callback-success = 
    ✅ I've sent you a private message with all the tags!

list-callback-error =
    ⚠️ I couldn't send you a private message. Please start a chat with me first

my-tags-header =
    📄 *Here's a list of the tags you're in, @{ $username }:*

no-subscription =
    ⚠️ You are not subscribed to any tags in this group, @{ $username }