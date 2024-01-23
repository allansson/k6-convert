import {
  toNodeId,
  type Analysis,
  type DeclarationInfo,
  type NodeId,
} from "~/src/analysis";
import { assign, declare, nil } from "~/src/convert/ast";
import { Rewriter, type RewriteMap } from "~/src/processing/rewrite";
import { createTestRewriter } from "~/src/processing/utils";

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
        "Could not find a scope when hoisting variables. This is a bug.",
      );
    }

    rewriter.insertBefore(
      scope.node,
      declare("let", declaration.node.identifier.name, nil()),
    );

    rewriter.replace(
      declaration.node,
      assign(declaration.node.identifier.name, declaration.node.expression),
    );
  }

  return rewriter.done();
}

export const hoistVariables = createTestRewriter(generateRewrites);
