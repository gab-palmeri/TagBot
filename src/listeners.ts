import { MyContext } from "@utils/customTypes";
import { Composer } from "grammy";
import { chatMemberHandler } from "handlers/listeners/chat_member";
import { hashtagHandler } from "handlers/listeners/hashtag";
import { messageHandler } from "handlers/listeners/message";
import { migrateHandler } from "handlers/listeners/migrate";
import { myGroupChatMemberHandler, myPrivateChatMemberHandler } from "handlers/listeners/my_chat_member";


const listeners = new Composer<MyContext>();

const listenersGroup = listeners.chatType("group");
const listenersPrivate = listeners.chatType("private");

// controlla se l'utente ha aggiornato il suo username
listenersGroup.on("message", () => messageHandler);

//hashtag
listenersGroup.on("::hashtag", () => hashtagHandler);

//deactivate or activat esubscriber when left
listenersGroup.on("chat_member", chatMemberHandler);

//handle bot add, promotion, kicked
listenersGroup.on("my_chat_member", myGroupChatMemberHandler);
// controlla se un utente entra o esce dal bot in privato
listenersPrivate.on("my_chat_member", myPrivateChatMemberHandler);

//chat migration
listenersGroup.on(":migrate_to_chat_id", migrateHandler);



//export the two vars
export { listenersGroup, listenersPrivate };