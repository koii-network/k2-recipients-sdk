function getListOfAllNodes(): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch(this.trustedNodeAddress + "/nodes")
      .then((res) => res.json())
      .then(async (res) => {
        const validNodes = await this.getNodesRunningAttentionGame(res);
        this.nodes = validNodes;
        resolve();
        // v =validNodes
      })
      .catch((e) => {
        this.nodes = [];
        console.error(e);
        // this.nodes.push(this.trustedNodeAddress);
      });
  });
}

async function  propagatePoRT(recipient ) {
    await this.initialize;
    let headers = {};
    // headers['x-request-signature'] = JSON.parse(headers['x-request-signature']);
    // headers = await this.signPort(trxId);
    try {
      2;
    } catch (e) {
      headers = {};
      console.log(e);
    }
    if (headers) {
      for (let i = 0; i < this.nodes.length; i++) {
        fetch(this.nodes[i] + `task/attention/submit-ports`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(headers),
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
      const response: boolean = await this.checkNodeAttentionGame(
        nodes[i]["data"]["url"]
      );
      if (response) nodesRunningAttentionGame.push(nodes[i]["data"]["url"]);
    }
    return nodesRunningAttentionGame;
  }
  checkNodeAttentionGame(node: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fetch(`${node}/attention`)
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