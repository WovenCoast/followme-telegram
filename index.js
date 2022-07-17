require("dotenv").config();
const { Telegraf } = require("telegraf");
const fs = require("fs");

/**
 * @type {{ name: string, description: string, execute: (ctx: import("telegraf").Context) => void | any }[]}
 */
const commands = [];

// /**
//  * @type {Map<string, Map<string, any>>}
//  */
// const states = new Map();

fs.readdirSync("./commands", { withFileTypes: true }).forEach((dirent) => {
  if (dirent.isFile()) {
    const command = require(`./commands/${dirent.name}`);
    if (!command.name) command.name = dirent.name.split(".")[0];
    commands.push(command);
  }
});

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
bot.start((ctx) => ctx.reply("Try doing /all instead"));

commands.forEach((command) => {
  bot.command(command.name, (ctx) => {
    // console.log(ctx);
    console.log(`${ctx.from.username} used /${command.name}`);
    command.execute(ctx);
  });
  if (command.actions) {
    Object.entries(command.actions).forEach(([key, func]) => {
      bot.action(key, (ctx) => {
        // console.log(ctx);
        func(ctx);
      });
    });
  }
});

bot.on("message", (ctx) => {
  commands.forEach((c) => {
    if (ctx.message.text.startsWith(`/${c.name}_`)) {
      console.log(`${ctx.from.username} used /${c.name}`);
      c.execute(ctx);
    }
  });
});

bot
  .launch()
  .then(async () =>
    console.log(`Logged in as ${(await bot.telegram.getMe()).username}!`)
  );

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
