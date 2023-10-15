import type { NodeId, NodePath } from "../analysis";
import type {
  AssignStatement,
  LogStatement,
  Statement,
  UserVariableDeclaration,
} from "../ast";
import {
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
  const newContext = statement.statements.reduce((result, statement, index) => {
    const childPath = [...context.self.path, index];
    const childId = toNodeId(childPath);

    const childScope: StatementInfo = {
      id: childId,
      index: index,
      path: childPath,
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
      [context.self.id]: {
        ...context.self,
        node: statement,
      },
    },
  };
}

function analyzeDeclaration(
  statement: UserVariableDeclaration,
  context: AnalysisContext
): AnalysisContext {
  return {
    ...context,
    declarations: [
      ...context.declarations,
      {
        ...context.self,
        node: statement,
        references: [],
      },
    ],
  };
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
