import type { NodeId, NodePath, ScopeInfo } from "../analysis";
import type {
  AssignStatement,
  LogStatement,
  Statement,
  UserVariableDeclaration,
} from "../ast";
import {
  report,
  withIndex,
  type AnalysisContext,
  type ScopedStatement,
  type StatementInfo,
} from "./analysis";
import { analyzeExpression } from "./expressions";

function toNodeId(path: NodePath): NodeId {
  return "/" + path.join("/");
}

function analyzeScopedStatement(
  statement: ScopedStatement,
  context: AnalysisContext
): AnalysisContext {
  const scope: ScopeInfo = {
    ...context.self,
    node: statement,
  };

  const newContext = statement.statements.reduce((result, statement, index) => {
    const childPath = [...context.self.path, index];
    const childId = toNodeId(childPath);

    const childScope: StatementInfo = {
      id: childId,
      index: index,
      path: childPath,
      scope,
      parent: context.self,
      node: statement,
    };

    const newContext = {
      ...result,
      self: childScope,
    };

    return analyzeStatement(statement, newContext);
  }, context);

  return {
    ...newContext,
    self: context.self,
    scopes: {
      ...newContext.scopes,
      [context.self.id]: scope,
    },
  };
}

function analyzeDeclaration(
  statement: UserVariableDeclaration,
  context: AnalysisContext
): AnalysisContext {
  const isRedclared = statement.name in context.frame;

  const info = {
    id: context.self.id,
    index: context.self.index,
    path: context.self.path,
    scope: context.self.scope,
    parent: context.self.parent,
    node: statement,
    references: [],
  };

  const newContext = {
    ...context,
    frame: {
      ...context.frame,
      [statement.name]: info,
    },
    declarations: [...context.declarations, info],
  };

  return isRedclared
    ? report(newContext, {
        type: "DuplicateVariableDeclaration",
        others: context.declarations
          .filter((declaration) => declaration.node.name === statement.name)
          .map((declaration) => declaration.node),
        node: statement,
      })
    : newContext;
}

function analyzeAssignStatement(
  statement: AssignStatement,
  context: AnalysisContext
): AnalysisContext {
  return analyzeExpression(statement.expression, context);
}

function analyzeLogStatement(
  statement: LogStatement,
  context: AnalysisContext
): AnalysisContext {
  return analyzeExpression(statement.expression, context);
}

const analyzeStatement = withIndex(
  (statement: Statement, context: AnalysisContext) => {
    switch (statement.type) {
      case "GroupStatement":
        return analyzeScopedStatement(statement, context);

      case "UserVariableDeclaration":
        return analyzeDeclaration(statement, context);

      case "AssignStatement":
        return analyzeAssignStatement(statement, context);

      case "LogStatement":
        return analyzeLogStatement(statement, context);

      default:
        return context;
    }
  }
);

export { analyzeScopedStatement };
