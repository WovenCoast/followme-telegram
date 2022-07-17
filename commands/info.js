const FollowMe = require("../classes/FollowMe");
const util = require("../util");
const moment = require("moment");

function format(info) {
  const lookupTable = {
    time: "Last report",
    image: "Thumbnail",
    lat: "Latitude",
    lon: "Longitude",
    course: "Bearing",
  };
  const transformations = {
    time: (t) => moment(t).fromNow(),
    speed: (s) => `${s} knots`,
  };
  let text = `Information for <b>${info.name}</b>\n`;
  Object.entries(info).forEach(
    ([k, v]) =>
      (text += `\n<b>${lookupTable[k] || util.titleCase(k)}</b>: ${
        typeof transformations[k] === "function"
          ? transformations[k](v)
          : v || "Unknown"
      }`)
  );
  return text;
}

/**
 * @param {import("telegraf").Context} ctx
 */
async function refresh(ctx) {
  const boatId = ctx.update.callback_query.message.text.match(/Id: (\d+)/)[1];
  const info = await FollowMe.fetch(boatId);
  await ctx.reply(format(info), {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Refresh",
            callback_data: "info_refresh",
          },
        ],
      ],
    },
  });
  await ctx.replyWithLocation(info.lat, info.lon);
}

module.exports = {
  actions: {
    info_refresh: refresh,
  },
  /**
   * @param {import("telegraf").Context} ctx
   */
  async execute(ctx) {
    const query = ctx.message.text.split(/[_ ]/g).slice(1).join(" ");
    ctx.replyWithChatAction("find_location");
    const info = await FollowMe.fetch(query);
    // console.log(query, info);
    if (!info)
      return ctx.reply(
        `Couldn't find a boat with ID of <b>${query}</b>. Did you mean to use /search_${query.replace(
          /\s+/g,
          "_"
        )} ?`,
        {
          parse_mode: "HTML",
        }
      );
    await ctx.reply(format(info), {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Refresh",
              callback_data: "info_refresh",
            },
          ],
        ],
      },
    });
    await ctx.replyWithLocation(info.lat, info.lon);
  },
};
