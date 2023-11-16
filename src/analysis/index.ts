import type {
  Analysis,
  AnalysisContext,
  ScopedStatement,
  ScopedStatementInfo,
  ScopeInfo,
} from "~/src/analysis/analysis";
import { analyzeStatements } from "~/src/analysis/statements";

function rootContext(statement: ScopedStatement): AnalysisContext {
  const scope: ScopeInfo = {
    id: "/",
    path: [],
    node: statement,
  };

  const self: ScopedStatementInfo = {
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
    issues: [],
  };
}

function analyze(statement: ScopedStatement): Analysis {
  const { statements, scopes, declarations, issues } = analyzeStatements(
    statement.statements,
    rootContext(statement)
  );

  return {
    statements,
    scopes,
    declarations,
    issues,
  };
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
