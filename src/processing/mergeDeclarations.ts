import { analyze } from "../analysis";
import type { Analysis, ScopedStatement } from "../analysis/analysis";
import { assign, declare, type Statement } from "../ast";
import { Chain, groupBy } from "../utils";
import { Rewriter, applyRewrites, type RewriteMap } from "./rewrite";

function generateRewrites(analysis: Analysis): RewriteMap {
  const rewriter = new Rewriter();

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

      rewriter.replace(
        first.node,
        declare("let", first.node.name, first.node.expression)
      );

      for (const duplicate of duplicates) {
        rewriter.replace(
          duplicate.node,
          assign(duplicate.node.name, duplicate.node.expression)
        );
      }
    }
  }

  return rewriter.done();
}

export function mergeDeclarations(statement: ScopedStatement): Statement {
  return new Chain(statement)
    .map(analyze)
    .map(generateRewrites)
    .map(applyRewrites(statement))
    .unwrap();
}
