import { create, IPFSHTTPClient, CID } from "ipfs-http-client";
import { SignKeyPair, sign } from "tweetnacl";
import bs58 from "bs58";
import fs from "fs";
import { submitRecipient } from "./helpers"
import { Web3Storage,getFilesFromPath } from 'web3.storage';

interface SignInterface {
  privateKey: Uint8Array;
  image: string;
  metadata: string;
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


async function registerRecipient(params: SignInterface, token: string) {
  const storageClient = new Web3Storage({ token });
  // const { image, privateKey, metadata } = params;
  const {privateKey} = params
  let upload = await getFilesFromPath([params.metadata,params.image])
  // let image = fs.readFileSync(params.image);
  // let metaData = fs.readFileSync(params.metadata)
  const wallet: SignKeyPair = sign.keyPair.fromSecretKey(privateKey);
  const publicKey = bs58.encode(wallet.publicKey);

  // const upload = [
  //   {
  //     path: "metadata.json",
  //     content: JSON.stringify(metadata),
  //   },
  //   {
  //     path: "image.jpeg",
  //     content: image,
  //   },
  // ];
  // let files = [];
  // let metaData = Buffer.from(upload[0].content);
  // let metaDataFile= new File([metaData], upload[0].path, { type: 'text/plain' });
  // let imageFile = new File([image],"image.jpeg")
  // let files = [metaData,image]
  // const result = new Array<IPFSResponseItem>();
  // for await (const response of client.addAll(upload, {
  //   wrapWithDirectory: true,
  // })) {
  //   console.log(response);
  //   result.push(response);
  // }
  let result = await storageClient.put(upload);
  console.log(result);
  const basePath = ""
    // result.find((e) => e.path == "")?.cid.toString() || "";
  const cid = ""
    // result.find((e) => e.path == "image.jpeg")?.cid?.toString() || "";

  // result.filter;
  const payload: PayloadInterface = {
    contentRegistryId: `IPFS:${result}:"/metadata.json"`,
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
  await submitRecipient(recipient)
  return recipient;
}
function encodeJSONToUint8Array(
  data: Record<string, unknown> | PayloadInterface
): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(data));
}

export { registerRecipient as registerIpfsNFT };

