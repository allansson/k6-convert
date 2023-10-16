import type {
  Analysis,
  AnalysisContext,
  ScopedStatement,
  ScopedStatementInfo,
  ScopeInfo,
} from "./analysis";
import { analyzeStatements } from "./statements";

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

export type {
  Analysis,
  DeclarationInfo,
  NodeId,
  NodePath,
  ReferenceInfo,
  ScopedStatementInfo as ScopeInfo,
  StatementInfo,
} from "./analysis";

export { analyze };
