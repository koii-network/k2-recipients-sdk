import dns from "dns";
import { SignKeyPair, sign } from "tweetnacl";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { readFileSync } from "jsonfile";
import prompt from "prompt";
import fetch from "node-fetch"
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

async function registerRecipient(params: SignInterface) {
  let verifySignature = "",
    verifyPublicKey = "";
  const { image, privateKey, metadata } = params;
  const wallet: SignKeyPair = sign.keyPair.fromSecretKey(privateKey);
  const publicKey = bs58.encode(wallet.publicKey);

  const payload: PayloadInterface = {
    contentRegistryId: `WEB2:${new URL(metadata.url as string).hostname}`,
    k2PubKey: publicKey,
  };

  const signature: Uint8Array = sign(
    encodeJSONToUint8Array(payload),
    wallet.secretKey
  );
  const  signedMessage = bs58.encode(signature),;
  const TxtRecords = await generateTxtRecords(
    bs58.encode(signature),
    publicKey
  );
  console.log("Please update the following TXT records");
  console.log(TxtRecords);
  prompt.start();
  const { updated } = await prompt.get({
    properties: {
      updated: {
        name: "Updated?",
        message: "Press y|Y if you have updated the DNS records.",
        required: true,
        pattern: /^(?:Yes|No|y|n)$/gi,
      },
    },
  });
  if (
    (updated as string).startsWith("y") ||
    (updated as string).startsWith("Y")
  ) {
    const txtVerify: string[] = await getTXTrecords(metadata.url as string);
    txtVerify.forEach((e) => {
      if (e.startsWith("signature-")) {
        verifySignature = e.substring(10);
      } else if (e.startsWith("publicKey-")) {
        verifyPublicKey = e.substring(10);
      } else {
        verifyPublicKey = "";
        verifySignature = "";
      }
    });
    try {
      console.log({ verifySignature, verifyPublicKey });
      //opening and verifying signature
      const verifiedPayload: Uint8Array | null = nacl.sign.open(
        decodePublicKey(verifySignature),
        decodePublicKey(verifyPublicKey)
      );
      console.log({ payload: verifiedPayload });
      if (!verifiedPayload) return { error: "Something Went Wrong" };
      //decoding Unit8Array to string
      const decodedPayload = new TextDecoder().decode(verifiedPayload);
      //verifying hash
      // const hash = crypto
      //   .createHash("sha256")
      //   .update(verifySignature)
      //   .digest("hex");
      // if (!hash.startsWith("00")) {
      //   console.log(hash);
      //   return { error: "Something Went Wrong" };
      // }
      return { signedMessage,publicKey,scheme:"WEB2" };
    } catch (e) {
      console.error(e);
      return { error: "Something Went Wrong" };
    }
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

async function getTXTrecords(urlStr: string): Promise<string[]> {
  const url: URL = new URL(urlStr);
  try {
    const records: string[][] = await resolveTxtAsync(url.origin);
    console.log({ records });
    return records.flat();
  } catch (e) {
    console.log(e);
    return [];
  }
}
function resolveTxtAsync(url: string): Promise<string[][]> {
  console.log({ url });
  return new Promise((resolve, reject) => {
    dns.resolveTxt(new URL(url).hostname, (error, addresses) => {
      console.log({ addresses });
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

export { registerRecipient as RegisterWEBNFT };

const wallet = readFileSync("../wallet.json");
const privateKey: Uint8Array = new Uint8Array(wallet);
console.log(privateKey);
registerRecipient({
  privateKey,
  metadata: {
    url: "https://www.salman-arshad.com/auth/v1",
  },
}).then((res) => {
  console.log(res);
  fetch("http://localhost:8887/attention/submit-recipients", {
    method: "POST",
    body: JSON.stringify(res),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then(console.log);
});
function decodePublicKey(publicKey: string) {
  return new Uint8Array(bs58.decode(publicKey));
}
