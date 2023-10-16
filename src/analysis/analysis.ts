import type {
  AstNode,
  GroupStatement,
  IdentifierExpression,
  Statement,
  UserVariableDeclaration,
} from "../ast";

interface UndeclaredVariableIssue {
  type: "UndeclaredVariable";
  node: IdentifierExpression;
}

interface DuplicateVariableDeclarationIssue {
  type: "DuplicateVariableDeclaration";
  others: UserVariableDeclaration[];
  node: UserVariableDeclaration;
}

type Issue = UndeclaredVariableIssue | DuplicateVariableDeclarationIssue;

type ScopedStatement = GroupStatement;

type NodeId = string;
type NodePath = number[];

interface NodeInfo<N extends AstNode = AstNode> {
  id: NodeId;
  path: NodePath;
  scope: ScopeInfo;
  parent: NodeInfo | null;
  node: N;
}

interface ReferenceInfo {
  path: NodePath;
  node: IdentifierExpression;
}

interface ScopeInfo {
  id: NodeId;
  path: NodePath;
  node: ScopedStatement;
}

type ScopedStatementInfo = NodeInfo<ScopedStatement>;
type StatementInfo = NodeInfo<Statement>;
type DeclarationInfo = NodeInfo<UserVariableDeclaration> & {
  references: ReferenceInfo[];
};

type DeclarationFrame = Record<string, DeclarationInfo>;

type NodeMap<N> = Record<NodeId, N>;

interface AnalysisContext {
  self: StatementInfo;
  scope: ScopeInfo;

  frame: DeclarationFrame;

  statements: NodeMap<StatementInfo>;
  scopes: NodeMap<ScopeInfo>;
  declarations: DeclarationInfo[];

  issues: Issue[];
}

interface Analysis {
  statements: Record<NodeId, StatementInfo>;
  scopes: Record<NodeId, ScopeInfo>;
  declarations: DeclarationInfo[];

  issues: Issue[];
}

type AnalysisFn<N extends AstNode> = (
  node: N,
  context: AnalysisContext
) => AnalysisContext;

function toNodeId(path: NodePath): NodeId {
  return "/" + path.join("/");
}

function withIndex<N extends AstNode>(fn: AnalysisFn<N>): AnalysisFn<N> {
  return (node: N, context: AnalysisContext) => {
    return fn(node, {
      ...context,
      statements: {
        ...context.statements,
        [context.self.id]: context.self,
      },
    });
  };
}

function report(context: AnalysisContext, issue: Issue) {
  return {
    ...context,
    issues: [...context.issues, issue],
  };
}

export {
  report,
  toNodeId,
  withIndex,
  type Analysis,
  type AnalysisContext,
  type DeclarationInfo,
  type NodeId,
  type NodePath,
  type ReferenceInfo,
  type ScopeInfo,
  type ScopedStatement,
  type ScopedStatementInfo,
  type StatementInfo,
};
