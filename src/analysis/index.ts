import type {
  Analysis,
  AnalysisContext,
  AnalysisIssue,
  ScopeInfo,
  StatementInfo,
} from "~/src/analysis/analysis";
import { analyzeStatements } from "~/src/analysis/statements";
import type { Result } from "~/src/context";
import type { BlockStatement } from "~/src/convert/ast";

function rootContext(statement: BlockStatement): AnalysisContext {
  const scope: ScopeInfo = {
    id: "/",
    path: [],
    node: statement,
  };

  const self: StatementInfo = {
    id: "/",
    path: [],
    scope,
    parent: null,
    node: statement,
  };

  return {
    self,
    scope,
    frame: {},
    statements: {
      [self.id]: self,
    },
    scopes: {
      [scope.id]: scope,
    },
    declarations: [],
  };
}

function analyze(
  statement: BlockStatement,
): Result<Analysis, AnalysisIssue, never> {
  return analyzeStatements(rootContext(statement), statement.statements).map(
    ({ statements, scopes, declarations }) => ({
      statements,
      scopes,
      declarations,
    }),
  );
}

export {
  toNodeId,
  type Analysis,
  type DeclarationInfo,
  type NodeId,
  type NodePath,
  type ReferenceInfo,
  type ScopedStatement,
  type ScopedStatementInfo,
  type ScopeInfo,
  type StatementInfo,
} from "~/src/analysis/analysis";

export { analyze };
