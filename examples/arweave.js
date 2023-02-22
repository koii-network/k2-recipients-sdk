const  { registerArweaveNFT } = require("../build/arweave");
const  jsonfile = require("jsonfile");

async function main() {
    // test


    const wallet = jsonfile.readFileSync("ar-wallet.json");
    const recipientDataArweave = await registerArweaveNFT(wallet, {
        contentRegistryId:
            "AR:QA7AIFVx1KBBmzC7WUNhJbDsHlSJArUT0jWrhZMZPS8:ss8ZdRMP5ViZ5GKzIu3uIyrYFL-skEWKXoV7ve3OjEQ",
        k2PubKey: "4HV3retNdHCnNR4Q9KKdug2qQXTKvd8PJCehGJ6gTUKN",
    });
    // console.log(
    //     inspect(recipientDataArweave, {
    //         showHidden: false,
    //         depth: null,
    //         colors: true,
    //     })
    // );
    //   await sendRecipientsToNodes(recipientDataArweave);
}



main();
