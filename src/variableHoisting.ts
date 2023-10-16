import {
  analyze,
  type Analysis,
  type DeclarationInfo,
  type NodeId,
  type NodePath,
  type ReferenceInfo,
} from "./analysis";
import type { GroupStatement, Statement } from "./ast";
import { rewrite, type RewriteMap } from "./rewrite";
import { Chain, groupBy } from "./utils";

function toScopeId(path: NodePath): NodeId {
  return "/" + path.join("/");
}

function findSharedScope(
  { scopes }: Analysis,
  declaration: DeclarationInfo,
  references: ReferenceInfo[]
) {
  for (let i = 0; i < declaration.scope.length; i++) {
    for (const reference of references) {
      if (reference.scope[i] === declaration.scope[i]) {
        continue;
      }

      const newPath = reference.scope.slice(0, -i);
      const scopeId = toScopeId(newPath);

      return scopes[scopeId];
    }
  }

  return scopes[declaration.id];
}

function generateRewrites(analysis: Analysis): RewriteMap {
  const rewrites: RewriteMap = new Map();

  const declarationsByScope = groupBy(
    analysis.declarations,
    (declaration) => declaration.scope.id
  );

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
