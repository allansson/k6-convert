import type * as es from "estree";

function spaceBetween<Node extends es.Node>(nodes: Node[]): Node[] {
  const newNodes = [...nodes];

  for (let i = 0; i < newNodes.length - 1; i++) {
    const node = newNodes[i];

    if (node === null || node === undefined || node.newLine === "none") {
      continue;
    }

    newNodes[i] = {
      ...node,
      newLine: "after",
    };
  }

  return newNodes;
}

function noSpaceBetween<Node extends es.Node>(nodes: Node[]): Node[] {
  return nodes.map((node, index) => {
    if (index === nodes.length - 1) {
      return node;
    }

    return {
      ...node,
      newLine: "none",
    };
  });
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

function newLine<N extends es.Node>(place: es.NewLine, node: N): N {
  return {
    ...node,
    newLine: place,
  };
}

function noSpacing<N extends es.Node>(node: N): N {
  return {
    ...node,
    newLine: "none",
  };
}

export { newLine, noSpaceBetween, noSpacing, spaceAfter, spaceBetween };
