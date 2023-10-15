import { expect, it } from "@jest/globals";
import { analyze } from "../analysis";
import { declare, group, identifier, log, string } from "../ast";

it("should index each statement by their id", () => {
  const groupNode = group("group", []);
  const declarationNode = declare("const", "a", string(""));

  const root = group("root", [groupNode, declarationNode]);

  const analysis = analyze(root);

  expect(analysis.statements).toEqual({
    "/": {
      id: "/",
      index: 0,
      path: [],
      parent: null,
      node: root,
    },
    "/0": {
      id: "/0",
      index: 0,
      path: [0],
      parent: {
        id: "/",
        index: 0,
        path: [],
        parent: null,
        node: root,
      },
      node: groupNode,
    },
    "/1": {
      id: "/1",
      index: 1,
      path: [1],
      parent: {
        id: "/",
        index: 0,
        path: [],
        parent: null,
        node: root,
      },
      node: declarationNode,
    },
  });
});

it("should register a new scope for each group", () => {
  const child = group("child", []);
  const root = group("root", [child]);

  const analysis = analyze(root);

  expect(analysis.scopes).toEqual(
    expect.objectContaining({
      "/": expect.objectContaining({
        id: "/",
        index: 0,
        path: [],
        parent: null,
        node: root,
      }),
      "/0": expect.objectContaining({
        id: "/0",
        path: [0],
        index: 0,
        parent: {
          id: "/",
          index: 0,
          path: [],
          parent: null,
          node: root,
        },
        node: child,
      }),
    })
  );
});

it("should keep track of declarations", () => {
  const declaration1 = declare("const", "a", string(""));
  const declaration2 = declare("const", "a", string(""));

  const root = group("root", [declaration1, declaration2]);

  const analysis = analyze(root);

  expect(analysis.declarations).toEqual([
    {
      id: "/0",
      index: 0,
      path: [0],
      parent: {
        id: "/",
        index: 0,
        path: [],
        parent: null,
        node: root,
      },
      node: declaration1,
      references: [],
    },
    {
      id: "/1",
      index: 1,
      path: [1],
      parent: {
        id: "/",
        index: 0,
        path: [],
        parent: null,
        node: root,
      },
      node: declaration2,
      references: [],
    },
  ]);
});

it("should keep track of references to declarations", () => {
  const declaration = declare("const", "a", string(""));

  const log1 = log(identifier("a"));
  const log2 = log(identifier("a"));

  const root = group("root", [declaration, log1, log2]);

  const analysis = analyze(root);

  expect(analysis.declarations).toEqual([
    {
      id: "/0",
      index: 0,
      path: [0],
      parent: {
        id: "/",
        index: 0,
        path: [],
        parent: null,
        node: root,
      },
      node: declaration,
      references: [
        {
          id: "/1",
          index: 1,
          path: [1],
          parent: {
            id: "/",
            index: 0,
            path: [],
            parent: null,
            node: root,
          },
          node: log1,
        },
        {
          id: "/2",
          index: 2,
          path: [2],
          parent: {
            id: "/",
            index: 0,
            path: [],
            parent: null,
            node: root,
          },
          node: log2,
        },
      ],
    },
  ]);
});
