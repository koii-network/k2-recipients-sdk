import { create, IPFSHTTPClient, CID } from "ipfs-http-client";
import { SignKeyPair, sign } from "tweetnacl";
import fetch from "node-fetch";
import bs58 from "bs58";
import fs from "fs";
import path from "path";
import { inspect } from "util";

const client: IPFSHTTPClient = create();
interface SignInterface {
  privateKey: Uint8Array;
  image: Buffer | Uint8Array;
  metadata: MetaData;
}
interface IPFSResponseItem {
  path: string;
  cid: CID;
  size: number;
}
interface MetaData {
  [x: string | number | symbol]: unknown;
}

async function main(params: SignInterface) {
  const { image, privateKey, metadata } = params;
  const wallet: SignKeyPair = sign.keyPair.fromSecretKey(privateKey);
  const publicKey = bs58.encode(wallet.publicKey);

  const upload = [
    {
      path: "metadata.json",
      content: JSON.stringify(metadata),
    },
    {
      path: "image.jpeg",
      content: image,
    },
  ];
  const result = new Array<IPFSResponseItem>();
  for await (const response of client.addAll(upload, {
    wrapWithDirectory: true,
  })) {
    console.log(response);
    result.push(response);
  }
  const basePath: string =
    result.find((e) => e.path == "")?.cid.toString() || "";
  const cid: string =
    result.find((e) => e.path == "image.jpeg")?.cid?.toString() || "";

  result.filter;
  const payload: PayloadInterface = {
    contentRegistryId: `IPFS:${basePath}:${cid}`,
    k2PubKey: publicKey,
  };
  const signature: Uint8Array = sign.detached(
    encodeJSONToUint8Array(payload),
    wallet.secretKey
  );
  const recipient = {
    signedMessage: JSON.stringify({
      data: {
        payload,
        timestamp: new Date().valueOf(),
      },
      signature: bs58.encode(signature),
    }),
    publicKey: bs58.encode(wallet.publicKey),
    scheme: "IPFS",
  };
  return recipient;
}
function encodeJSONToUint8Array(
  data: Record<string, unknown> | PayloadInterface
): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(data));
}
//test
main({
  privateKey: new Uint8Array([
    16, 179, 201, 59, 157, 142, 252, 32, 11, 119, 232, 101, 245, 5, 225, 239,
    198, 225, 229, 71, 137, 216, 16, 218, 189, 7, 85, 152, 61, 139, 4, 13, 254,
    57, 244, 142, 109, 82, 53, 187, 235, 187, 57, 34, 227, 112, 112, 124, 134,
    154, 131, 29, 35, 170, 42, 87, 50, 12, 252, 56, 98, 253, 36, 168,
  ]),
  image: fs.readFileSync(path.join(__dirname, "../image.jpeg")),
  metadata: {
    "owner": "J7Pp3r627N9XMG6GnX3TqqJRquzjCeB15vBf4SarC8RM",
    "title": "Vin Avatar",
    "name": "Vinciis",
    "description": "Vin demo avatar for test",
    "ticker": "KOINFT",
    "balances": {
      "J7Pp3r627N9XMG6GnX3TqqJRquzjCeB15vBf4SarC8RM": 1
    },
    "contentType": "image/png",
    "createdAt": "1654017641",
    "tags": [
      "vinciis",
      " blinds",
      " arweave",
      " koii"
    ],
    "isNsfw": false
  }
}).then((res) => {
  console.log(inspect(res, { showHidden: false, depth: null, colors: true }));
  fetch(
    "http://localhost:8887/Attention22222222222222222222222222222222222/submit-recipients",
    {
      method: "POST",
      body: JSON.stringify(res),
      headers: {'content-type': 'application/json'},
    }
  )
    .then((res) => res.json())
    .then((res) => console.log(res));
});

interface PayloadInterface {
  contentRegistryId: string;
  k2PubKey: string;
}
