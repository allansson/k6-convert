import { analyze } from "../analysis";
import type { Analysis, ScopedStatement } from "../analysis/analysis";
import { assign, declare, type Statement } from "../ast";
import { Chain, groupBy } from "../utils";
import { applyRewrites, replace, type RewriteMap } from "./rewrite";

function generateRewrites(analysis: Analysis): RewriteMap {
  const rewrites: RewriteMap = new Map();

  const declarationsByScope = groupBy(
    analysis.declarations,
    (declaration) => declaration.scope.id
  );

  for (const declarations of Object.values(declarationsByScope)) {
    const declarationsByVariable = groupBy(
      declarations,
      (declaration) => declaration.node.name
    );

    for (const [first, ...duplicates] of Object.values(
      declarationsByVariable
    )) {
      if (first === undefined || duplicates.length === 0) {
        continue;
      }

      rewrites.set(
        first.node,
        replace(declare("let", first.node.name, first.node.expression))
      );

      for (const duplicate of duplicates) {
        rewrites.set(
          duplicate.node,
          replace(assign(duplicate.node.name, duplicate.node.expression))
        );
      }
    }
  }

  return rewrites;
}

export function mergeDeclarations(statement: ScopedStatement): Statement {
  return new Chain(statement)
    .map(analyze)
    .map(generateRewrites)
    .map(applyRewrites(statement))
    .unwrap();
}
