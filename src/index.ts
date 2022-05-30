import { create } from "ipfs-http-client";
import dotenv from "dotenv";

dotenv.config();
// let neacl = require("tweetnacl");
import nacl from "tweetnacl";
import jsonfile from "jsonfile";
import { createHash } from "crypto";
import fetch from "node-fetch";
import bs58 from "bs58";
import crypto from "crypto";
const IMAGE_PATH = "/home/dev/soll/ipfss/image.jpeg";
const WALLET_LOCATION = "/home/dev/soll/ipfss/image.jpeg";
const fs = require("fs");

console.log(process.env["IMAGE_PATH"]);

// const { publicKey, secretKey } = nacl.sign.keyPair.fromSecretKey(
//   new Uint8Array(jsonfile.readFileSync("test_wallet_keypair.json"))
// );

const client = create();

let aJsonString = JSON.stringify({
  hello: "world2",
});


async function main() {
  let img = fs.readFileSync(IMAGE_PATH);
  let files = [
    {
      path: "metadata.json",
      content: JSON.stringify({
        o: 1,
      }),
    },
    {
      path: "image.jpeg",
      content: img
    },
  ];


  for await (const result of client.addAll(files, {
    wrapWithDirectory: true,
  })) {
    console.log(result);
  }
}
// client.addAll
// cid = await client.addAll(
//   { path: "metadata.json", content: aJsonString },
//   { wrapWithDirectory: true }
// );

// console.log(cid);
main();
