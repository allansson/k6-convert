import type { Result } from "~/src/context";
import type {
  AstNode,
  GroupStatement,
  Identifier,
  Statement,
  VariableDeclaration,
} from "~/src/convert/ast";

interface UndeclaredVariableIssue {
  type: "UndeclaredVariable";
  node: Identifier;
}

interface DuplicateVariableDeclarationIssue {
  type: "DuplicateVariableDeclaration";
  others: VariableDeclaration[];
  node: VariableDeclaration;
}

type AnalysisIssue =
  | UndeclaredVariableIssue
  | DuplicateVariableDeclarationIssue;

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
  id: NodeId;
  path: NodePath;
  scope: ScopeInfo;
  node: Identifier;
}

interface ScopeInfo {
  id: NodeId;
  path: NodePath;
  node: Statement;
}

type ScopedStatementInfo = NodeInfo<ScopedStatement>;
type StatementInfo = NodeInfo<Statement>;
type DeclarationInfo = NodeInfo<VariableDeclaration> & {
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
}

interface Analysis {
  statements: Record<NodeId, StatementInfo>;
  scopes: Record<NodeId, ScopeInfo>;
  declarations: DeclarationInfo[];
}

type AnalysisFn<N extends AstNode> = (
  context: AnalysisContext,
  node: N,
) => AnalysisResult;

type AnalysisResult = Result<AnalysisContext, AnalysisIssue, never>;

function toNodeId(path: NodePath): NodeId {
  return "/" + path.join("/");
}

function withIndex<N extends AstNode>(fn: AnalysisFn<N>): AnalysisFn<N> {
  return (context: AnalysisContext, node: N) => {
    return fn(
      {
        ...context,
        statements: {
          ...context.statements,
          [context.self.id]: context.self,
        },
      },
      node,
    );
  };
}

export {
  toNodeId,
  withIndex,
  type Analysis,
  type AnalysisContext,
  type AnalysisIssue,
  type AnalysisResult,
  type DeclarationInfo,
  type NodeId,
  type NodePath,
  type ReferenceInfo,
  type ScopeInfo,
  type ScopedStatement,
  type ScopedStatementInfo,
  type StatementInfo,
};
