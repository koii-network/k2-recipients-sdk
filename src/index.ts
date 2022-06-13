import * as ipfs from "./ipfs"
import * as arweave from "./arweave"
import fs from "fs";
import path from "path";
import { inspect } from "util";
import fetch from "node-fetch";
async function main() {
    // test
    const metadata = {
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
    // let recipientsData = await ipfs.registerRecipient({
    //     privateKey: new Uint8Array([
    //         16, 179, 201, 59, 157, 142, 252, 32, 11, 119, 232, 101, 245, 5, 225, 239,
    //         198, 225, 229, 71, 137, 216, 16, 218, 189, 7, 85, 152, 61, 139, 4, 13, 254,
    //         57, 244, 142, 109, 82, 53, 187, 235, 187, 57, 34, 227, 112, 112, 124, 134,
    //         154, 131, 29, 35, 170, 42, 87, 50, 12, 252, 56, 98, 253, 36, 168,
    //     ]),
    //     image: fs.readFileSync(path.join(__dirname, "../image.jpeg")),
    //     metadata: metadata
    // })
    // console.log(inspect(recipientsData, { showHidden: false, depth: null, colors: true }));
    // await sendRecipientsToNodes(recipientsData)
    await arweave.registerRecipient()
}

async function sendRecipientsToNodes(recipientsData: any) {
    let resJson = await fetch(
        "http://localhost:8887/Attention22222222222222222222222222222222222/submit-recipients",
        {
            method: "POST",
            body: JSON.stringify(recipientsData),
            headers: { 'content-type': 'application/json' },
        }
    )
    let res = await resJson.json()
    console.log(res)
}

main()