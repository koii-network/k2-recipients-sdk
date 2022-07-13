import dns from "dns";
import { create, IPFSHTTPClient, CID } from "ipfs-http-client";
import { SignKeyPair, sign } from "tweetnacl";
import bs58 from "bs58";
import { readFileSync } from "jsonfile";

interface SignInterface {
  privateKey: Uint8Array;
  image?: Buffer | Uint8Array | string;
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
interface PayloadInterface {
  contentRegistryId: string;
  k2PubKey: string;
}

const client: IPFSHTTPClient = create();

async function registerRecipient(params: SignInterface) {
  const { image, privateKey, metadata } = params;
  const wallet: SignKeyPair = sign.keyPair.fromSecretKey(privateKey);
  const publicKey = bs58.encode(wallet.publicKey);

  const payload: PayloadInterface = {
    contentRegistryId: metadata.url as string,
    k2PubKey: publicKey,
  };

  const signature: Uint8Array = sign.detached(
    encodeJSONToUint8Array(payload),
    wallet.secretKey
  );
  const TxtRecords = await generateTxtRecords(
    bs58.encode(signature),
    publicKey
  );
  console.log(TxtRecords);
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

async function checkTXTrecords(urlStr: string) {
  const url: URL = new URL(urlStr);
  try{
    const records:string[][]= await resolveTxtAsync(url.origin);
  }
}
function resolveTxtAsync(url: string):Promise<string[][]> {
  return new Promise((resolve, reject) => {
    dns.resolveTxt("url", (error, addresses) => {
      error ? reject(error) : resolve(addresses);
    });
  });
}

async function generateTxtRecords(signature: string, publicKey: string) {
  return [
    {
      "@": "signature-" + signature,
    },
    {
      "@": "publicKey-" + publicKey,
    },
  ];
}
function encodePublicKey(publicKey: Uint8Array): string {
  return bs58.encode(
    Buffer.from(publicKey.buffer, publicKey.byteOffset, publicKey.byteLength)
  );
}

export { registerRecipient };

const wallet = readFileSync("../wallet.json");
const privateKey: Uint8Array = new Uint8Array(wallet);
console.log(privateKey);
registerRecipient({
  privateKey,
  metadata: {
    url: "https://gogle.com",
  },
});
