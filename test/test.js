const Arweave = require("arweave");
const { readContract } = require("smartweave");
const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});
const fetch = require("node-fetch");
function fetchState(tx) {
  return new Promise((resolve) => {
    fetch("https://mainnet.koii.live/attention/nft?id=" + tx)
      .then(async (res) => {
        if (res.status !== 200) {
          try {
            console.log("reading contract");
            let state = await readContract(arweave, tx);
            return new Promise((r) => r(state));
          } catch (e) {
            return new Promise((r) => {
              r([]);
            });
          }
        } else return res.json();
      })
      .then((res) => {
        resolve(res);
      })
      .catch(() => {
        resolve([]);
      });
  });
}

fetchState("Gvc5LI3zGPSzzTVete5h1t8AZKOmsNXMnO5PF6DgZDM").then(console.log);
