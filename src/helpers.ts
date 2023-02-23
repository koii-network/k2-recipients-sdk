interface NodeInterface {
  data: NodeDataInterface;
  signature:string;
  owner:string;
}
export interface NodeDataInterface {
  url: string;
  timestamp: number;
}
import fetch from "node-fetch";

let nodes: string | any[] = []
let trustedNodeAddress = "http://localhost:8080"
function getListOfAllNodes(): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch(trustedNodeAddress + "/nodes/Attention22222222222222222222222222222222222")
      .then((res) => res.json())
      .then(async (res) => {
        const validNodes = await getNodesRunningAttentionGame(res);

        // eslint-disable-next-line
        nodes = validNodes as any;
        resolve();
        // v =validNodes
      })
      .catch((e) => {
        nodes = [];
        console.error(e);
        // this.nodes.push(this.trustedNodeAddress);
      });
  });
}

export async function submitRecipient (recipient:any) {
 console.log(recipient);

  // headers['x-request-signature'] = JSON.parse(headers['x-request-signature']);
  // headers = await this.signPort(trxId);
  await getListOfAllNodes();

  if (recipient) {
    console.log(nodes);
    for (let i = 0; i < nodes.length; i++) {
      let res = await fetch(nodes[i] + `/attention/submit-recipients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipient),
      })
        .then((res) => res.json())
        .then(console.log)
        .catch(console.log);

      // console.log(headers);
    }

  }
}

async function getNodesRunningAttentionGame(nodes: Array<NodeInterface>) {
  const nodesRunningAttentionGame: Array<string> = [];
  for (let i = 0; i < nodes.length; i++) {
    const response: boolean = await checkNodeAttentionGame(
      nodes[i]["data"]["url"]
    );
    if (response) nodesRunningAttentionGame.push(nodes[i]["data"]["url"]);
  }
  return nodesRunningAttentionGame;
}
function checkNodeAttentionGame(node: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    console.log(node);
    if (node.includes("<")) {
      return resolve(false)
    }
    fetch(`${node}/attention/id`)
      .then((res) => {
        if (res.status !== 200) return resolve(false);
        return resolve(true);
      })
      .catch((e) => {
        console.log(e);
        return resolve(false);
      });
  });
}