import {
  analyze,
  type Analysis,
  type DeclarationInfo,
  type ScopeInfo,
} from "./analysis";
import type { GroupStatement, Statement } from "./ast";
import { insertBefore, rewrite, type RewriteMap } from "./rewrite";
import { Chain } from "./utils";

function findSharedScope(declaration: DeclarationInfo): ScopeInfo | null {
  if (declaration.scope === null) {
    throw new Error(
      "Declarations should not exist outside of a scope. This is a bug!"
    );
  }

  for (let i = 0; i < declaration.scope.path.length; i++) {
    const scopeIndex = declaration.scope.path[i];

    for (const reference of declaration.references) {
      if (scopeIndex !== reference.path[i]) {
        return reference.scope;
      }
    }
  }

  return declaration.scope;
}

function generateRewrites(analysis: Analysis): RewriteMap {
  const rewrites: RewriteMap = new Map();

  for (const declaration of analysis.declarations) {
    const sharedScope = findSharedScope(declaration);

    if (sharedScope?.id === declaration.scope?.id) {
      continue;
    }

    rewrites.set(declaration.id, insertBefore(sharedScope?.node));
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
