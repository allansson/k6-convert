import type * as es from "estree";

function spaceBetween<Node extends es.Node>(nodes: Node[]): Node[] {
  const newNodes = [...nodes];

  for (let i = 0; i < newNodes.length - 1; i++) {
    const node = newNodes[i];

    if (node === null || node === undefined) {
      continue;
    }

    newNodes[i] = {
      ...node,
      newLine: "after",
    };
  }

  return newNodes;
}

function spaceAfter<Node extends es.Node>(nodes: Node[]): Node[] {
  const lastNode = nodes[nodes.length - 1];

  if (lastNode === undefined) {
    return nodes;
  }

  return [
    ...nodes.slice(0, -1),
    {
      ...lastNode,
      newLine: "after",
    },
  ];
}

export { spaceAfter, spaceBetween };
