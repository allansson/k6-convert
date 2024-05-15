import { describe, expect, it } from "vitest";
import { analyze, type ScopeInfo, type StatementInfo } from "~/src/analysis";

import {
  block,
  declare,
  group,
  identifier,
  log,
  string,
  type BlockStatement,
} from "~/src/convert/ast";

function createRootScope(statement: BlockStatement): ScopeInfo {
  return {
    id: "/",
    path: [],
    node: statement,
  };
}

function createRootParent(statement: BlockStatement): StatementInfo {
  return {
    id: "/",
    path: [],
    scope: createRootScope(statement),
    parent: null,
    node: statement,
  };
}

describe("indexing", () => {
  it("should index each statement by their id", () => {
    const groupNode = group("group", []);
    const declarationNode = declare("const", "a", string(""));

    const root = block([groupNode, declarationNode]);

    const analysis = analyze(root).unsafeUnwrap();

    const rootScope = createRootScope(root);
    const rootParent = createRootParent(root);

    expect(analysis.statements).toEqual({
      "/": rootParent,
      "/0": {
        id: "/0",
        path: [0],
        scope: rootScope,
        parent: rootParent,
        node: groupNode,
      },
      "/1": {
        id: "/1",
        path: [1],
        scope: rootScope,
        parent: rootParent,
        node: declarationNode,
      },
    } satisfies typeof analysis.statements);
  });
});

describe("scopes", () => {
  it("should register a new scope for each group", () => {
    const child = group("child", []);
    const root = block([child]);

    const analysis = analyze(root).unsafeUnwrap();

    expect(analysis.scopes).toEqual({
      "/": createRootScope(root),
      "/0": {
        id: "/0",
        path: [0],
        node: child,
      },
    } satisfies typeof analysis.scopes);
  });
});

describe("declarations", () => {
  it("should keep track of declarations", () => {
    const declaration1 = declare("const", "a", string(""));
    const declaration2 = declare("const", "a", string(""));

    const root = block([declaration1, declaration2]);

    const analysis = analyze(root).unsafeUnwrap();

    const rootScope = createRootScope(root);
    const rootParent = createRootParent(root);

    expect(analysis.declarations).toEqual([
      {
        id: "/0",
        path: [0],
        scope: rootScope,
        parent: rootParent,
        node: declaration1,
        references: [],
      },
      {
        id: "/1",
        path: [1],
        scope: rootScope,
        parent: rootParent,
        node: declaration2,
        references: [],
      },
    ] satisfies typeof analysis.declarations);
  });

  it("should report an issue when a variable is re-declared", () => {
    const declaration = declare("const", "a", string(""));
    const redeclaration = declare("const", "a", string(""));

    const root = block([declaration, group("child", [redeclaration])]);

    const analysis = analyze(root);

    expect(analysis.issues).toEqual([
      {
        type: "DuplicateVariableDeclaration",
        others: [declaration],
        node: redeclaration,
      },
    ]);
  });
});

describe("references", () => {
  it("should keep track of references to declarations", () => {
    const declaration = declare("const", "a", string(""));

    const reference1 = identifier("a");
    const reference2 = identifier("a");

    const root = block([
      declaration,
      log("log", reference1),
      log("log", reference2),
    ]);

    const analysis = analyze(root).unsafeUnwrap();

    const rootScope = createRootScope(root);
    const rootParent = createRootParent(root);

    expect(analysis.declarations).toEqual([
      {
        id: "/0",
        path: [0],
        scope: rootScope,
        parent: rootParent,
        node: declaration,
        references: [
          {
            id: "/1",
            path: [1],
            scope: rootScope,
            node: reference1,
          },
          {
            id: "/2",
            path: [2],
            scope: rootScope,
            node: reference2,
          },
        ],
      },
    ] satisfies typeof analysis.declarations);
  });

  it("should keep track of reference in other declaration expression", () => {
    const declaration1 = declare("const", "a", string(""));

    const reference = identifier("a");

    const declaration2 = declare("const", "b", reference);

    const root = block([declaration1, declaration2]);

    const analysis = analyze(root).unsafeUnwrap();

    const rootScope = createRootScope(root);
    const rootParent = createRootParent(root);

    expect(analysis.declarations).toEqual([
      {
        id: "/0",
        path: [0],
        scope: rootScope,
        parent: rootParent,
        node: declaration1,
        references: [
          {
            id: "/1",
            path: [1],
            scope: rootScope,
            node: reference,
          },
        ],
      },
      {
        id: "/1",
        path: [1],
        scope: rootScope,
        parent: rootParent,
        node: declaration2,
        references: [],
      },
    ] satisfies typeof analysis.declarations);
  });

  it("should report an issue when referencing an undeclare variable", () => {
    const declaration = declare("const", "a", string(""));

    const reference = identifier("b");

    const root = block([declaration, log("log", reference)]);

    const result = analyze(root);

    expect(result.issues).toEqual([
      {
        type: "UndeclaredVariable",
        node: reference,
      },
    ]);
  });

  it("should reference the latest declaration of a variable", () => {
    const declaration1 = declare("const", "a", string(""));
    const declaration2 = declare("const", "a", string(""));

    const reference1 = identifier("a");
    const reference2 = identifier("a");

    const child = group("child", [
      declaration2,
      log("log", reference1),
      log("log", reference2),
    ]);

    const root = block([declaration1, child]);

    const analysis = analyze(root).unsafeUnwrap();

    const rootScope = createRootScope(root);
    const rootParent = createRootParent(root);

    const childScope = {
      id: "/1",
      path: [1],
      node: child,
    };

    const childParent = {
      id: "/1",
      path: [1],
      scope: rootScope,
      parent: rootParent,
      node: child,
    };

    expect(analysis.declarations).toEqual([
      {
        id: "/0",
        path: [0],
        scope: rootScope,
        parent: rootParent,
        node: declaration1,
        references: [],
      },
      {
        id: "/1/0",
        path: [1, 0],
        scope: childScope,
        parent: childParent,
        node: declaration2,
        references: [
          {
            id: "/1/1",
            path: [1, 1],
            scope: childScope,
            node: reference1,
          },
          {
            id: "/1/2",
            path: [1, 2],
            scope: childScope,
            node: reference2,
          },
        ],
      },
    ] satisfies typeof analysis.declarations);
  });
});
