const axios = require("axios");
const fuzzy = require("fuzzy");

const api = "http://followme.mv/api/v3";

/**
 * @typedef {"Fishing Dhoni" | "Speed Boat" | "Supply Boat" | "Safari" | "Dinghy" | "Yacht" | "Landing Craft" | "Jet Ski" | "Excursion Dhoni" | "Tug Boat" | "Dhoni" | "Oil Barge"} BoatType
 *
 */
/**
 * @typedef {Object} BoatData
 * @property {string} id Internal ID that FollowMe uses
 * @property {string} name Name of the boat
 * @property {string} time Timestamp for the last report from the boat
 * @property {string} speed Speed of the boat
 * @property {BoatType} type Type of boat
 * @property {string} image Thumbnail for the boat
 * @property {string|null} port Port that the boat is in, if docked or close to
 */
/**
 * @typedef {BoatData} BoatLocation
 * @property {string} speed Speed of the boat (in knots probably, not sure)
 * @property {string} course Bearing of the boat
 * @property {string} lat Latitude of boat location
 * @property {string} lon Longitude of boat location
 */

class FollowMe {
  /**
   * @returns {BoatData[]}
   */
  static async all() {
    const res = await axios
      .get(`${api}/public`, {
        headers,
      })
      .catch((e) => e.response);
    // the data is in html format with the json inside the body
    res.data = JSON.parse(
      res.data.split("<body>")[1].replace(/<\/?([A-Za-z]+)>/g, "")
    );
    if ((res.data || {}).status !== "ok") return [];
    return Object.entries(res.data.data).map(([id, data]) => {
      return { id, ...data };
    });
  }
  /**
   * @param {string} query
   * @returns {BoatData[]}
   */
  static async search(query) {
    const all = await FollowMe.all();
    const matches = fuzzy.filter(query, all, {
      extract: (item) => item.name,
    });
    return matches.slice(0, 10).map((e) => e.original);
  }
  /**
   * @param {string} id
   * @returns {BoatLocation}
   */
  static async fetch(id) {
    const res = await axios
      .get(`${api}/public/${id}`, {
        headers,
      })
      .catch((e) => e.response);
    // same as ln13
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
