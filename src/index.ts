import { create, IPFSHTTPClient } from "ipfs-http-client";
import {SignKeyPair,sign,verify} from "tweetnacl";
import { createHash } from "crypto";
import fetch from "node-fetch";
import bs58 from "bs58";
import crypto from "crypto";

import fs from "fs";

console.log(process.env["IMAGE_PATH"]);

// const IMAGE_PATH = "/home/dev/soll/ipfss/image.jpeg";
// const WALLET_LOCATION = "/home/dev/soll/ipfss/image.jpeg";

// dotenv.config();
// const { publicKey, secretKey } = nacl.sign.keyPair.fromSecretKey(
//   new Uint8Array(jsonfile.readFileSync("test_wallet_keypair.json"))
// );

const client: IPFSHTTPClient = create();
interface SignInterface {
  privateKey: Uint8Array;
  image: Buffer | Uint8Array;
  metadata: MetaData;
}
interface MetaData {
  [x: string | number | symbol]: unknown;
}

async function main(params: SignInterface) {
  const { image, privateKey, metadata } = params;
  const wallet:SignKeyPair = sign.keyPair.fromSecretKey(privateKey);



  const files = [
    {
      path: "metadata.json",
      content: JSON.stringify(
        metadata,
      ),
    },
    {
      path: "image.jpeg",
      content: image,
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
main({
  privateKey: new Uint8Array([
    16, 179, 201, 59, 157, 142, 252, 32, 11, 119, 232, 101, 245, 5, 225, 239,
    198, 225, 229, 71, 137, 216, 16, 218, 189, 7, 85, 152, 61, 139, 4, 13, 254,
    57, 244, 142, 109, 82, 53, 187, 235, 187, 57, 34, 227, 112, 112, 124, 134,
    154, 131, 29, 35, 170, 42, 87, 50, 12, 252, 56, 98, 253, 36, 168,
  ]),
  image: fs.readFileSync("../image.jpeg"),
  metadata: {
    name: "salman",
  },
});
