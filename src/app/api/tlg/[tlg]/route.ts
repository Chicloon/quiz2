import TelegramApi from "node-telegram-bot-api";

const handler = (req: NextRequest) => {
  console.log("----- ");
  console.log(" run bot ");
  console.log("----- ");

  const token = "5638005581:AAFfqLFFPbmQiHvGtEZ-yr67bFNkdDU1lrQ";
  const bot = new TelegramApi(token, { polling: true });

  bot.on("message", (msg) => {
    const text = msg.text;
    const chat = msg.chat.id;
    bot.sendMessage(chat, "Test: " + text);
  });
};

export { handler as GET, handler as POST };
