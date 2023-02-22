const ipfs = require("ipfs-http-client");
let IPFSClient = ipfs.create({
  url: "https://ipfs.io",
  port: 443,
  protocol: "https",
});
async function f() {
  let metadata = "";
  for await (const buffer of IPFSClient.cat(
    "bafybeid3bd5yqj4jk5een2l52uar6nrlyvn3mbjwleh6smhpg76cfkxhka" +
      "/metadata.json"
  )) {
    metadata += buffer;
  }
  console.log(metadata);
}

f();
