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
import { Chain } from "./utils";

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

// Gå igenom varje deklaration för ett variabelnamn. Om något variabelnamn
// inte kan nå en deklaration så måste deklarationen lyftas till det scope
// där den kan nås av variabeln.
//
// Om nästa deklaration hamnar på samma scope som den förra så ska deklarationen
// återanvändas.
//
// Om nästa deklaration hamnar

function generateRewrites(analysis: Analysis): RewriteMap {
  const rewrites: RewriteMap = new Map();

  analysis.declarations.forEach((declaration) => {
    const references = analysis.references[declaration.id] ?? [];

    if (references.length === 0) {
      return;
    }

    const sharedScope = findSharedScope(analysis, declaration, references);

    if (sharedScope === undefined || sharedScope.id !== declaration.id) {
      return;
    }
  });

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
