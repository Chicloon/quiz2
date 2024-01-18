/* eslint-disable @typescript-eslint/no-floating-promises */
import TelegramApi from "node-telegram-bot-api";
import { Markup, Telegraf } from "telegraf";

console.log("----- ");
console.log(" run bot ");
console.log("----- ");

export default async function TgBot() {
  const token = "5638005581:AAFfqLFFPbmQiHvGtEZ-yr67bFNkdDU1lrQ";

  const bot = new Telegraf(token);

  bot.start((ctx) => {
    ctx.reply("Welcome");
    ctx.reply("Welcome, bro");

    // ctx.reply(JSON.stringify(ctx));
    // await ctx.reply(JSON.stringify(ctx.update));
    ctx.reply(JSON.stringify(ctx.message.from));
    ctx.reply(JSON.stringify(ctx.message.from.username));
  });

  bot.launch();
}
