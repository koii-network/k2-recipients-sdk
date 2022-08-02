import dns from "dns";
import { create, IPFSHTTPClient, CID } from "ipfs-http-client";
import { SignKeyPair, sign } from "tweetnacl";
import bs58 from "bs58";
import { readFileSync } from "jsonfile";
import prompt from "prompt";

interface SignInterface {
  privateKey: Uint8Array;
  image?: Buffer | Uint8Array | string;
  metadata: MetaData;
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
    contentRegistryId: `WEB2:${new URL(metadata.url as string).hostname}`,
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
  console.log("Please update the following TXT records");
  console.log(TxtRecords);
  prompt.start()
  const { updated } = await prompt.get({
    properties: {
      updated: {
        name:"Updated?" ,
        message: "Press y|Y if you have updated the DNS records.",
        required: true,
        pattern:/^(?:Yes|No|y|n)$/gi
      },
    },
  });
  if ((updated as string ).startsWith("y") || (updated as string).startsWith("Y")) {
    let txtVerify:string[]= await getTXTrecords(metadata.url as string);
    let signature: string,publicKey:string;
    txtVerify.forEach(e=>{
      if (e.startsWith("signature-")){
        signature=e.substring(10);
      } else if(e.startsWith("publicKey-")){
        publicKey=e.substring(10);
      }
    })

  }

  const recipient = {
    signedMessage: JSON.stringify({
      data: {
        payload,
        timestamp: new Date().valueOf(),
      },
      signature: bs58.encode(signature),
    }),
    publicKey: bs58.encode(wallet.publicKey),
    scheme: "WEB2.0",
  };
  return recipient;
}
function encodeJSONToUint8Array(
  data: Record<string, unknown> | PayloadInterface
): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(data));
}

async function getTXTrecords(urlStr: string):Promise<string[]>{
  const url: URL = new URL(urlStr);
  try {

    const records: string[][] = await resolveTxtAsync(url.origin);
    return records.flat();

  } catch (e) {
    console.log(e);
    return [];
  }
}
function resolveTxtAsync(url: string): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    dns.resolveTxt(url, (error, addresses) => {
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
    url: "https://gogle.com/hello",
  },
});
