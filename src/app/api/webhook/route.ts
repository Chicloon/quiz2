import { bot } from "../../../../src/bot.js";
import { webhookCallback } from "grammy";

// webhookCallback will make sure that the correct middleware(listener) function is called
export const POST = webhookCallback(bot, "std/http");
