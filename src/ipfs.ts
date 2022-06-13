import { create, IPFSHTTPClient, CID } from "ipfs-http-client";
import { SignKeyPair, sign } from "tweetnacl";
import bs58 from "bs58";

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
interface PayloadInterface {
  contentRegistryId: string;
  k2PubKey: string;
}

const client: IPFSHTTPClient = create();

async function registerRecipient(params: SignInterface) {
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


export {registerRecipient};