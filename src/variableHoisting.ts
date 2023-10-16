import {
  analyze,
  toNodeId,
  type Analysis,
  type DeclarationInfo,
  type NodeId,
} from "./analysis";
import {
  assign,
  declare,
  nil,
  type GroupStatement,
  type Statement,
} from "./ast";
import { insertBefore, replace, rewrite, type RewriteMap } from "./rewrite";
import { Chain } from "./utils";

function findSharedScope(declaration: DeclarationInfo): NodeId {
  for (let i = 0; i < declaration.scope.path.length; i++) {
    const scopeIndex = declaration.scope.path[i];

    for (const reference of declaration.references) {
      if (scopeIndex !== reference.path[i]) {
        return toNodeId(declaration.scope.path.slice(0, i + 1));
      }
    }
  }

  return declaration.id;
}

function generateRewrites(analysis: Analysis): RewriteMap {
  const rewrites: RewriteMap = new Map();

  for (const declaration of analysis.declarations) {
    const scopeId = findSharedScope(declaration);

    if (scopeId === declaration.id) {
      continue;
    }

    const scope = analysis.scopes[scopeId];

    if (scope === undefined) {
      throw new Error(
        "Could not find a scope when hoisting variables. This is a bug."
      );
    }

    rewrites.set(
      scope.node,
      insertBefore(declare("let", declaration.node.name, nil()))
    );

    rewrites.set(
      declaration.node,
      replace(assign(declaration.node.name, declaration.node.expression))
    );
  }

  return rewrites;
}

function applyRewrites(statement: Statement) {
  return (rewrites: RewriteMap) => rewrite(statement, rewrites);
}

export function hoistVariables(statement: GroupStatement): Statement {
  return new Chain(statement)
    .map(analyze)
    .log("analysis")
    .map(generateRewrites)
    .map(applyRewrites(statement))
    .unwrap();
}
