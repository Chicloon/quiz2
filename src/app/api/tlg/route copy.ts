import { InlineKeyboardMarkup } from "node-telegram-bot-api";
import { Markup, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { QuestionInstance, QuizInstance } from "~/models";
import { AnswerInstance } from "~/models/Quiz/Answer";
import { getBaseUrl } from "~/utils/api";

// const token = process.env.NEXT_TELEGRAM_TOKEN as string;

console.log("this code runs on server");

export default async function () {
  const token = "5638005581:AAFfqLFFPbmQiHvGtEZ-yr67bFNkdDU1lrQ";
  const url = getBaseUrl() + "/api/trpc";

  const formQuestion = ({
    description,
    answers,
  }: {
    description: string;
    answers: AnswerInstance[];
  }) => {
    let text = `Вопрос № ${questionIdx + 1}: <i>${description}</i>\n
   <b>Варианты ответа: </b>\n `;

    answers.forEach((el, idx) => {
      text += `<i>Ответ ${String.fromCharCode(65 + idx)}: ${el.text}</i>\n`;
    });
    return text;
  };

  const getKeyboard = (buttonsNumber: number) => {
    const keys = [];
    while (buttonsNumber > 0) {
      buttonsNumber--;

      keys.push(
        Markup.button.callback(
          String.fromCharCode(65 + buttonsNumber),
          buttonsNumber.toString(),
        ),
      );
    }
    return Markup.inlineKeyboard(keys.reverse());
  };

  // Markup.inlineKeyboard([
  //   Markup.button.callback("1", "1"),
  //   Markup.button.callback("2", "2"),
  //   Markup.button.callback("3", "3"),
  //   Markup.button.callback("4", "4"),
  // ]);

  let quiz: QuizInstance;
  let questions: QuestionInstance[] = [];
  let questionIdx = 0;
  let quizId = "";
  let applicantId = "";

  const bot = new Telegraf(token);

  bot.start(async (ctx) => {
    console.log(ctx);
    // const

    questionIdx = 0;

    const inlineKeyboard: InlineKeyboardMarkup = {
      inline_keyboard: [[{ text: "button1" }]],
    };

    ctx.reply("Welcome");
    ctx.reply(JSON.stringify(ctx));
    ctx.reply(JSON.stringify(ctx.update));
    ctx.reply(JSON.stringify(ctx.message.from));
    ctx.reply(JSON.stringify(ctx.message.from.username));
    const getData = async () => {
      const resp = await fetch(`${url}/quiz.getAll`);
      const quizData: { result: { data: { json: QuizInstance[] } } } =
        await resp.json();
      console.log("🚀 ~ getData ~ quizData:", quizData);

      // const quizez = quizData.result.data.json;
      quizId = quizData.result.data.json[0]?.id || "";

      try {
        const resp = await fetch(
          `${url}/bot.getById?` +
            new URLSearchParams({
              batch: "1",
              input: `{"0":{"json":"${quizId}"}}`,
            }),
        );

        await resp.json().then((res) => {
          console.log("--- res", res);
          quiz = res[0].result.data.json;
        });

        ctx.reply("Вопросы получены");
      } catch (error) {
        ctx.reply("Что-то пошло не так");
        ctx.reply("Ошибка: " + JSON.stringify(error));
      }
    };

    const createApplicant = async () => {
      const newApplicant = await fetch(`${url}/bot.createApplicant?batch=1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          0: {
            json: {
              name: ` ${ctx.message.from.first_name} ${ctx.message.from.last_name}`,
              quizId,
            },
          },
        }),
      }).then((el) => el.json());
      console.log(newApplicant);
      applicantId = newApplicant[0].result.data.json.id;
      console.log("🚀 ~ createApplicant ~ res:", newApplicant);
      console.log("---- user created");
    };
    await getData();
    await createApplicant();

    questions = quiz.questions;
    console.log("--- quiz", quiz);

    await ctx.reply(`<u>Опросник</u>: <b>${quiz.title}</b>`, {
      parse_mode: "HTML",
    });

    ctx.reply(JSON.stringify(questions));
    if (questions && questions.length > 0) {
      const question = questions[0]!;
      // const question = formQuestion(questions[0]!);
      console.log("--- question", question);
      await ctx.reply(
        `<b>Вопрос № ${questionIdx + 1}:</b> ${question.description}`,
        { parse_mode: "HTML" },
      );
      question.answers.forEach(async (el, idx) => {
        const text = `<i>Ответ ${String.fromCharCode(65 + idx)}: ${
          el.text
        }</i>\n`;

        await ctx.reply(text, { parse_mode: "HTML" });
      });
      await ctx.reply(
        "Выберете правильный вариант",
        getKeyboard(questions[0]!.answers.length),
      );
    }
  });

  bot.action(["0", "1", "2", "3"], async (ctx) => {
    console.log("---- ", ctx, ctx.match);
    const answerNumber = parseInt(ctx.match[0]);
    console.log("🚀 ~ bot.action ~ answerNumber:", answerNumber);
    const currentAnswer = questions[questionIdx]?.answers[answerNumber];
    console.log("🚀 ~ bot.action ~ currentAnswer:", currentAnswer);

    const res = await fetch(`${url}/bot.sendAnswer?batch=1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        0: {
          json: {
            applicantId,
            answerId: currentAnswer?.id || "someId",
            answerNumber,
          },
        },
      }),
    }).then((el) => el.json());

    console.log("🚀 ~ bot.action ~ res:", res);

    ctx.reply("Ваш ответ: " + ctx.match[0]);
    questionIdx += 1;
    if (questions[questionIdx]) {
      // const question = formQuestion(questions[questionIdx]!);
      const question = questions[questionIdx]!;

      await ctx.reply(
        `<b>Вопрос № ${questionIdx + 1}:</b> ${question.description}`,
        { parse_mode: "HTML" },
      );

      question.answers.forEach(async (el, idx) => {
        const text = `<i>Ответ ${String.fromCharCode(65 + idx)}: ${
          el.text
        }</i>\n`;

        await ctx.reply(text, { parse_mode: "HTML" });
      });

      await ctx.reply(
        "Выберете правильный вариант",
        getKeyboard(questions[questionIdx]!.answers.length),
      );
    } else {
      ctx.reply("Вопросы кончились", Markup.removeKeyboard());
    }
  });
  bot.hears("button1", (ctx) => ctx.reply("Pushed button 1"));
  bot.help((ctx) => ctx.reply("Send me a sticker"));
  bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
  bot.hears("hi", (ctx) =>
    ctx.reply(
      "Hey there",
      Markup.keyboard([
        ["☸ Setting", "📞 Feedback"], // Row2 with 2 buttons
        ["📢 Ads", "⭐️ Rate us", "👥 Share"], // Row3 with 3 buttons
      ]),
    ),
  );
  bot.hears("ho", (ctx) => {
    ctx.reply(
      "inline",
      Markup.inlineKeyboard([
        Markup.button.callback("button1", "button1"),
        Markup.button.callback("button2", "button2"),
        Markup.button.callback("button2", "aasdfasdfasdfs"),
      ]),
    );
  });

  bot.launch();

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  // export default bot;
}
