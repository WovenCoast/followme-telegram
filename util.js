module.exports = {
  chunkArr(arr, chunkSize = 10) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      chunks.push(chunk);
    }
    return chunks;
  },
  titleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },
};
