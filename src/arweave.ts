import crypto from 'crypto';
import bs58 from 'bs58';
import { Connection } from '@_koi/web3.js';
import nacl from 'tweetnacl';
import * as arweaveUtils from 'arweave/node/lib/utils';
import Arweave from 'arweave';
const arweave = Arweave.init({
    host: 'arweave.net',
    protocol: 'https',
    port: 443,
    timeout: 10000,
    logging: false,
});
import { submitRecipient } from "./helpers"


async function registerArweaveNFT(wallet: any, payload: any) {
    let data: any = {};
    try {
        let signPayload = await proofOfWork(wallet, {
            data: {
                payload,
                timeStamp: Math.floor(+new Date() / 1000),
            },
        });
        data['signedMessage'] = JSON.stringify({
            data: signPayload['data'],
            signature: signPayload['signature'],
        });
        data['publicKey'] = signPayload.owner;
        data['scheme'] = 'AR';

        await submitRecipient(data);

    } catch (e) {
        console.log(e);
        throw {
            name: 'Generic Error',
            description: 'Something went wrong while generating headers',
        };
    }
}
async function proofOfWork(wallet: any, payload: any): Promise<any> {
    let nonce = 0;
    const loopCondition = true;
    let signedPayload: any = {};
    while (loopCondition) {
        payload.data.nonce = nonce;
        signedPayload = await signPayload(payload, wallet);
        let e = crypto.createHash('sha256').update(JSON.stringify(signedPayload.signature)).digest('hex');
        if (difficultyFunction(e)) {
            console.log(e);
            break;
        }
        nonce++;
    }
    return signedPayload;
}
function difficultyFunction(hash: any) {
    return hash.startsWith('00') || hash.startsWith('01');
}
/**
 * Sign payload
 * @param payload Payload to sign
 * @returns Signed payload with signature
 */
async function signPayload(payload: any, wallet: any): Promise<any> {
    const data = payload.data || payload.vote || null;
    const jwk = wallet;
    const publicModulus = jwk.n;
    const dataInString = JSON.stringify(data);
    const dataIn8Array = arweaveUtils.stringToBuffer(dataInString);
    const rawSignature = await arweave.crypto.sign(jwk, dataIn8Array);
    payload.signature = arweaveUtils.bufferTob64Url(rawSignature);
    payload.owner = publicModulus;
    return payload;
}

function encodeDataBase58(data: any) {
    return bs58.encode(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
}
export { registerArweaveNFT };


