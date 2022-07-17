const axios = require("axios");
const fuzzy = require("fuzzy");

const api = "http://followme.mv/api/v3";
const headers = {
  Accept: "application/json",
};

class FollowMe {
  static async all() {
    const res = await axios
      .get(`${api}/public`, {
        headers,
      })
      .catch((e) => e.response);
    res.data = JSON.parse(
      res.data.split("<body>")[1].replace(/<\/?([A-Za-z]+)>/g, "")
    );
    if ((res.data || {}).status !== "ok") return [];
    return Object.entries(res.data.data).map(([id, data]) => {
      return { id, ...data };
    });
  }
  static async search(query) {
    const all = await FollowMe.all();
    const matches = fuzzy.filter(query, all, {
      extract: (item) => item.name,
    });
    return matches.slice(0, 10).map((e) => e.original);
  }
  static async fetch(id) {
    const res = await axios
      .get(`${api}/public/${id}`, {
        headers,
      })
      .catch((e) => e.response);
    res.data = JSON.parse(
      res.data.split("<body>")[1].replace(/<\/?([A-Za-z]+)>/g, "")
    );
    if ((res.data || {}).status !== "ok") return null;
    const boats = Object.entries(res.data.data).map(([id, data]) => {
      return { id, ...data };
    });
    // only at this step do we know if we fucked up or not
    if (boats.length !== 1) return null;
    return boats[0];
  }
}

module.exports = FollowMe;
