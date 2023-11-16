import {
  analyze,
  toNodeId,
  type Analysis,
  type DeclarationInfo,
  type NodeId,
} from "~/src/analysis";
import {
  assign,
  declare,
  nil,
  type GroupStatement,
  type Statement,
} from "~/src/convert/ast";
import {
  Rewriter,
  applyRewrites,
  type RewriteMap,
} from "~/src/processing/rewrite";
import { Chain } from "~/src/utils";

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
  const rewriter = new Rewriter();

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

    rewriter.insertBefore(
      scope.node,
      declare("let", declaration.node.name, nil())
    );

    rewriter.replace(
      declaration.node,
      assign(declaration.node.name, declaration.node.expression)
    );
  }

  return rewriter.done();
}

export function hoistVariables(statement: GroupStatement): Statement {
  return new Chain(statement)
    .map(analyze)
    .map(generateRewrites)
    .map(applyRewrites(statement))
    .unwrap();
}
