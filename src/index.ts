import * as ipfs from "./ipfs";
import * as arweave from "./arweave";
import fs from "fs";
import path from "path";
import { inspect } from "util";
import fetch from "node-fetch";
import nacl from "tweetnacl";
const jsonfile = require("jsonfile");
import dotenv from "dotenv";
dotenv.config();
async function main() {
  // test
  const metadata = {
    owner: "J7Pp3r627N9XMG6GnX3TqqJRquzjCeB15vBf4SarC8RM",
    title: "Vin Avatar",
    name: "Vinciis",
    description: "Vin demo avatar for test",
    ticker: "KOINFT",
    balances: {
      J7Pp3r627N9XMG6GnX3TqqJRquzjCeB15vBf4SarC8RM: 1,
    },
    contentType: "image/png",
    createdAt: "1654017641",
    tags: ["vinciis", " blinds", " arweave", " koii"],
    isNsfw: false,
  };
  //  IPFS recipient Signing
  //-----------------------------
  // let recipientsDataIPFS = await ipfs.registerRecipient({
  //     privateKey: new Uint8Array([
  //         16, 179, 201, 59, 157, 142, 252, 32, 11, 119, 232, 101, 245, 5, 225, 239,
  //         198, 225, 229, 71, 137, 216, 16, 218, 189, 7, 85, 152, 61, 139, 4, 13, 254,
  //         57, 244, 142, 109, 82, 53, 187, 235, 187, 57, 34, 227, 112, 112, 124, 134,
  //         154, 131, 29, 35, 170, 42, 87, 50, 12, 252, 56, 98, 253, 36, 168,
  //     ]),
  //     image: fs.readFileSync(path.join(__dirname, "../image.jpeg")),
  //     metadata: metadata
  // })
  // console.log(inspect(recipientsDataIPFS, { showHidden: false, depth: null, colors: true }));
  // await sendRecipientsToNodes(recipientsDataIPFS)

  //  Arweave Ports Signing
  //-----------------------------

  // const { publicKey, secretKey } = nacl.sign.keyPair.fromSecretKey(
  //     new Uint8Array(jsonfile.readFileSync(process.env.WALLET_LOCATION || ""))
  // );
  // const portDataArweave = await arweave.registerPort(
  //     'AR:QA7AIFVx1KBBmzC7WUNhJbDsHlSJArUT0jWrhZMZPS8:ss8ZdRMP5ViZ5GKzIu3uIyrYFL-skEWKXoV7ve3OjEQ',
  //     publicKey,
  //     secretKey
  // );

  // Arweave Recipient Signing
  // ----------------------------

  const wallet = jsonfile.readFileSync("ar-wallet.json");
  const recipientDataArweave = await arweave.registerRecipient(wallet, {
    contentRegistryId:
      "AR:QA7AIFVx1KBBmzC7WUNhJbDsHlSJArUT0jWrhZMZPS8:ss8ZdRMP5ViZ5GKzIu3uIyrYFL-skEWKXoV7ve3OjEQ",
    k2PubKey: "4HV3retNdHCnNR4Q9KKdug2qQXTKvd8PJCehGJ6gTUKN",
  });
  console.log(
    inspect(recipientDataArweave, {
      showHidden: false,
      depth: null,
      colors: true,
    })
  );
  await sendRecipientsToNodes(recipientDataArweave);
}

async function sendRecipientsToNodes(recipientsData: any) {
  let rawResponse = await fetch(
    "http://localhost:8887/attention/submit-recipients",
    {
      method: "POST",
      body: JSON.stringify(recipientsData),
      headers: { "content-type": "application/json" },
    }
  );
  let res = await rawResponse.json();
  console.log(res);
}

main();
