import { CommandGroup } from "@grammyjs/commands";
import { MyContext } from "utils/customTypes";
import { canCreate, checkIfPrivate, canUpdate } from "utils/middlewares";
import { createHandler } from "handlers/commands/create";
import { deleteHandler } from "handlers/commands/delete";
import { helpCommandHandler } from "handlers/commands/help";
import { joinHandler } from "handlers/commands/join";
import { leaveHandler } from "handlers/commands/leave";
import { listHandler } from "handlers/commands/list";
import { mytagsHandler } from "handlers/commands/mytags";
import { renameHandler } from "handlers/commands/rename";
import { restartHandler } from "handlers/commands/restart";
import { settingsHandler } from "handlers/commands/settings";
import { startCommandHandler } from "handlers/commands/start";

const tagbotCommands = new CommandGroup<MyContext>();

tagbotCommands.command("start", "Start the bot", startCommandHandler);
tagbotCommands.command("help", "Show the list of commands", helpCommandHandler);
tagbotCommands.command("restart", "Restart the bot").addToScope({ type: "all_group_chats" }, restartHandler);
tagbotCommands.command("settings", "Change the settings of the bot", [checkIfPrivate, settingsHandler]);

tagbotCommands.command("join", "Join a tag").addToScope({ type: "all_group_chats" }, joinHandler);
tagbotCommands.command("leave", "Leave a tag").addToScope({ type: "all_group_chats" }, leaveHandler);
tagbotCommands.command("mytags", "List your tags").addToScope({ type: "all_group_chats" }, mytagsHandler);

tagbotCommands.command("create", "Create a tag").addToScope({ type: "all_group_chats" }, [canCreate, createHandler]);
tagbotCommands.command("delete", "Delete a tag").addToScope({ type: "all_group_chats" }, [canUpdate, deleteHandler]);
tagbotCommands.command("rename", "Rename a tag").addToScope({ type: "all_group_chats" }, [canUpdate, renameHandler]);
tagbotCommands.command("list", "List all tags").addToScope({ type: "all_group_chats" }, listHandler);


export default tagbotCommands;
