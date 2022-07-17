const FollowMe = require("../classes/FollowMe");
const util = require("../util");

const pageSize = 10;
const extra = {
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Previous",
          callback_data: "all_prev",
        },
        {
          text: "Next",
          callback_data: "all_next",
        },
      ],
    ],
  },
};

function formatPage(page, pageIndex, totalPages) {
  let text = `Page ${
    pageIndex + 1
  } of ${totalPages} - <b>To search for a boat, use /search boatname</b>\n`;
  page.forEach((e, i) => {
    text += `\n${i + 1 + pageIndex * pageSize}: /info_${e.id} : ${e.name}`;
  });
  return text;
}

/**
 * @param {import("telegraf").Context} ctx
 */
async function previous(ctx) {
  const pages = util.chunkArr(await FollowMe.all(), pageSize);
  const nextPage =
    (parseInt(
      ctx.update.callback_query.message.text.match(/Page (\d+) of \d+/)[1]
    ) - 1 || 0) - 1;
  if (nextPage < 0) return ctx.answerCbQuery("Invalid page requested");

  ctx.telegram.editMessageText(
    ctx.update.callback_query.message.chat.id,
    ctx.update.callback_query.message.message_id,
    undefined,
    formatPage(pages[nextPage], nextPage, pages.length),
    extra
  );
}
/**
 * @param {import("telegraf").Context} ctx
 */
async function next(ctx) {
  const pages = util.chunkArr(await FollowMe.all(), pageSize);
  const nextPage =
    (parseInt(
      ctx.update.callback_query.message.text.match(/Page (\d+) of \d+/)[1]
    ) - 1 || 0) + 1;
  if (nextPage >= pages.length)
    return ctx.answerCbQuery("Invalid page requested");

  ctx.telegram.editMessageText(
    ctx.update.callback_query.message.chat.id,
    ctx.update.callback_query.message.message_id,
    undefined,
    formatPage(pages[nextPage], nextPage, pages.length),
    extra
  );
}

module.exports = {
  actions: {
    all_prev: previous,
    all_next: next,
  },
  /**
   * @param {import("telegraf").Context} ctx
   */
  async execute(ctx) {
    const pages = util.chunkArr(await FollowMe.all(), pageSize);
    ctx.reply(formatPage(pages[0], 0, pages.length), extra);
  },
};
