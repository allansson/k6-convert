import type { Analysis } from "~/src/analysis";
import { assign, declare } from "~/src/convert/ast";
import { Rewriter, type RewriteMap } from "~/src/processing/rewrite";
import { createTestRewriter } from "~/src/processing/utils";
import { groupBy } from "~/src/utils";

function generateRewrites(analysis: Analysis): RewriteMap {
  const rewriter = new Rewriter();

  const declarationsByScope = groupBy(
    analysis.declarations,
    (declaration) => declaration.scope.id,
  );

  for (const declarations of Object.values(declarationsByScope)) {
    const declarationsByVariable = groupBy(
      declarations,
      (declaration) => declaration.node.name,
    );

    for (const [first, ...duplicates] of Object.values(
      declarationsByVariable,
    )) {
      if (first === undefined || duplicates.length === 0) {
        continue;
      }

      rewriter.replace(
        first.node,
        declare("let", first.node.name, first.node.expression),
      );

      for (const duplicate of duplicates) {
        rewriter.replace(
          duplicate.node,
          assign(duplicate.node.name, duplicate.node.expression),
        );
      }
    }
  }

  return rewriter.done();
}

export const mergeDeclarations = createTestRewriter(generateRewrites);
