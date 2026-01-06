import { MyContext } from "utils/customTypes";
import { joinTag } from "utils/joinTag";

export async function joinTagCallbackQueryHandler(ctx: MyContext) {
  const data = ctx.callbackQuery.data;
  const tagName = data.split("_")[1];

  const groupId = ctx.callbackQuery.message.chat.id.toString();
  const userId = ctx.callbackQuery.from.id.toString();

  const joinResult = await joinTag(
    tagName,
    groupId,
    userId
  );

  switch (joinResult) {
    case "START_BOT": {
        
      const msg = ctx.t("join.start-bot-msg");

      await ctx.answerCallbackQuery({
        text: msg,
        show_alert: true
      });
      break;
    }

    case "JOINED": {
        const msg = ctx.t("join.ok-callback", { tagName });
        await ctx.answerCallbackQuery({
          text: msg,
          show_alert: true,
        });  
        break;
    }

    case "ALREADY_SUBSCRIBED": {
        const msg = ctx.t("join.already-subscribed", { tagName });
        await ctx.answerCallbackQuery({
          text: msg,
          show_alert: true,
        });
        break;
    }
    case "TAG_NOT_FOUND": {
        const msg = ctx.t("tag.validation-not-found", { tagName, count: 1 });
        await ctx.answerCallbackQuery({
          text: msg,
          show_alert: true,
        });
        break;
    }
  }
}
