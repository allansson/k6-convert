import type { Analysis } from "../analysis";
import type { AnalysisContext, ScopeInfo, ScopedStatement } from "./analysis";
import { analyzeScopedStatement } from "./statements";

function rootContext(statement: ScopedStatement): AnalysisContext {
  const self: ScopeInfo = {
    id: "/",
    index: 0,
    path: [],
    parent: null,
    node: statement,
  };

  return {
    self,
    statements: {
      [self.id]: self,
    },
    scopes: {},
    declarations: [],
    issues: [],
  };
}

function analyze(statement: ScopedStatement): Analysis {
  const { statements, scopes, declarations } = analyzeScopedStatement(
    statement,
    rootContext(statement)
  );

  return {
    statements,
    scopes,
    declarations,
  };
}

export type {
  Analysis,
  DeclarationInfo,
  NodeId,
  NodePath,
  ReferenceInfo,
  ScopeInfo,
  StatementInfo,
} from "./analysis";

export { analyze };
