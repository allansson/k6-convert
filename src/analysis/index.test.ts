import { describe, expect, it } from "@jest/globals";
import { analyze } from ".";
import { declare, group, identifier, log, string } from "../ast";
import type { ScopedStatement, ScopedStatementInfo } from "./analysis";
import { type ScopeInfo } from "./analysis";

function createRootScope(statement: ScopedStatement): ScopeInfo {
  return {
    id: "/",
    path: [],
    node: statement,
  };
}

function createRootParent(statement: ScopedStatement): ScopedStatementInfo {
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

    const root = group("root", [groupNode, declarationNode]);

    const analysis = analyze(root);

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
    const root = group("root", [child]);

    const analysis = analyze(root);

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

    const root = group("root", [declaration1, declaration2]);

    const analysis = analyze(root);

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

    const root = group("root", [declaration, group("child", [redeclaration])]);

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

    const root = group("root", [declaration, log(reference1), log(reference2)]);

    const analysis = analyze(root);

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
            path: [1],
            node: reference1,
          },
          {
            path: [2],
            node: reference2,
          },
        ],
      },
    ]);
  });

  it("should report an issue when referencing an undeclare variable", () => {
    const declaration = declare("const", "a", string(""));

    const reference = identifier("b");

    const root = group("root", [declaration, log(reference)]);

    const analysis = analyze(root);

    expect(analysis.issues).toEqual([
      {
        type: "UndeclaredVariable",
        node: reference,
      },
    ]);
  });

  it("should reference the latest declaration of a variable", () => {
    const declaration = declare("const", "a", string(""));

    const reference1 = identifier("a");
    const reference2 = identifier("a");

    const root = group("root", [declaration, log(reference1), log(reference2)]);

    const analysis = analyze(root);

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
            path: [1],
            node: reference1,
          },
          {
            path: [2],
            node: reference2,
          },
        ],
      },
    ]);
  });
});
