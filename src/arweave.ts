import crypto from 'crypto';
import bs58 from 'bs58';
import { Connection } from '@_koi/web3.js';
import nacl from 'tweetnacl';
import * as arweaveUtils from 'arweave/node/lib/utils';
import Arweave from 'arweave';
export const arweave = Arweave.init({
    host: 'arweave.net',
    protocol: 'https',
    port: 443,
    timeout: 10000,
    logging: false,
});

async function registerPort(resourceId: string, publicKey: Uint8Array, secretKey: Uint8Array) {
    let connection = new Connection(process.env.K2_NODE_URL || 'http://localhost:8899', 'confirmed');
    let epochInfo = await connection.getEpochInfo();
    let nonce = 0;
    let payload = {
        resource: resourceId,
        timestamp: new Date().valueOf(),
        nonce,
        scheme: 'AR',
        epoch: epochInfo.epoch,
    };
    let signedMessage = null;
    let data = {};
    while (true) {
        let msg = new TextEncoder().encode(JSON.stringify(payload));
        payload.nonce++;
        signedMessage = nacl.sign(msg, secretKey);
        const hash = crypto.createHash('sha256').update(encodeDataBase58(signedMessage)).digest('hex');
        if (difficultyFunction(hash)) {
            console.log(hash);
            break;
        }
        nonce++;
    }
    data = {
        signedMessage: encodeDataBase58(signedMessage),
        publicKey: encodeDataBase58(publicKey),
    };
    return data;
}

async function registerRecipient(wallet: any, payload: any) {
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

        return data;
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
export { registerPort, registerRecipient };
