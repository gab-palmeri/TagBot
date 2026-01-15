import { MyContext } from "utils/customTypes";
import { Composer } from "grammy";
import { chatMemberHandler } from "handlers/listeners/chat_member";
import { hashtagHandler } from "handlers/listeners/hashtag";
import { joinTagCallbackQueryHandler } from "handlers/listeners/join-tag_callback_query";
import { newChatTitleHandler } from "handlers/listeners/new_chat_title";
import { migrateHandler } from "handlers/listeners/migrate";
import { myGroupChatMemberHandler, myPrivateChatMemberHandler } from "handlers/listeners/my_chat_member";
import { showAllTagsCallbackQueryHandler } from "handlers/listeners/show-all-tags_callback_query";

const listeners = new Composer<MyContext>();

listeners.chatType(["group", "supergroup"])
.on("::hashtag", hashtagHandler) //hashtag
.on(":new_chat_title", newChatTitleHandler) // check if a group has changed name
.callbackQuery(/^join-tag_/, joinTagCallbackQueryHandler) // join tag callback query
.callbackQuery(/^show-all-tags/, showAllTagsCallbackQueryHandler) // show full tag list callback queries
.on("chat_member", chatMemberHandler) // deactivate or activate subscriber when left + check admin changes
.on(":migrate_from_chat_id", migrateHandler) // chat migration
.on("my_chat_member", myGroupChatMemberHandler); // handle bot add, promotion, kicked

listeners.chatType("private")
.on("my_chat_member", myPrivateChatMemberHandler); // check if an user enters or leaves the bot in private

export default listeners;