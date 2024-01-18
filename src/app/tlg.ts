import TelegramApi from "node-telegram-bot-api";

console.log("----- ");
console.log(" run bot ");
console.log("----- ");

export default async function () {
  const token = "5638005581:AAFfqLFFPbmQiHvGtEZ-yr67bFNkdDU1lrQ";
  const bot = new TelegramApi(token, { polling: true });

  bot.on("message", (msg) => {
    const text = msg.text;
    const chat = msg.chat.id;
    bot.sendMessage(chat, "Test: " + text);
  });
}
