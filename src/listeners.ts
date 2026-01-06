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

const listenersGroup = listeners.chatType("group");
const listenersPrivate = listeners.chatType("private");

//hashtag
listenersGroup.on("::hashtag", hashtagHandler);

// check if a group has changed name
listenersGroup.on(":new_chat_title", newChatTitleHandler);

// callback queries
listenersGroup.callbackQuery(/^join-tag_/, joinTagCallbackQueryHandler);
listenersGroup.callbackQuery(/^show-all-tags/, showAllTagsCallbackQueryHandler);

// deactivate or activate subscriber when left, and check admin changes
listenersGroup.on("chat_member", chatMemberHandler);

// handle bot add, promotion, kicked
listenersGroup.on("my_chat_member", myGroupChatMemberHandler);

// check if an user enters or leaves the bot in private
listenersPrivate.on("my_chat_member", myPrivateChatMemberHandler);

// chat migration
listenersGroup.on(":migrate_to_chat_id", migrateHandler);



// export the two vars
export { listenersGroup, listenersPrivate };