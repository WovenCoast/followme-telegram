const FollowMe = require("../classes/FollowMe");

const matchesLimit = 5;

function format(matches, query) {
  if (matches.length === 0)
    return `Couldn't find any boats with the name <b>${query}</b>. Try using /all to see what boats FollowMe can track`;
  let text = `Boats matching <b>${query}</b>\n`;
  matches.forEach((e) => {
    text += `\n/info_${e.id} : ${e.name}`;
  });
  return text;
}

module.exports = {
  /**
   * @param {import("telegraf").Context} ctx
   */
  async execute(ctx) {
    const query = ctx.message.text.split(/[_ ]/g).slice(1).join(" ");
    ctx.replyWithChatAction("typing");
    const matches = (await FollowMe.search(query)).slice(0, matchesLimit);
    ctx.reply(format(matches, query), {
      parse_mode: "HTML",
    });
  },
};
