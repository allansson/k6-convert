import {
  report,
  withIndex,
  type AnalysisContext,
  type NodeId,
  type NodePath,
  type ScopeInfo,
  type ScopedStatement,
  type StatementInfo,
} from "~/src/analysis/analysis";
import { analyzeExpression } from "~/src/analysis/expressions";
import {
  type AssignStatement,
  type ExpressionStatement,
  type LogStatement,
  type SleepStatement,
  type Statement,
  type UserVariableDeclaration,
} from "~/src/convert/ast";
import { exhaustive } from "~/src/utils";

function toNodeId(path: NodePath): NodeId {
  return "/" + path.join("/");
}

function analyzeStatements(
  context: AnalysisContext,
  statements: Statement[]
): AnalysisContext {
  return statements.reduce((result, statement, index) => {
    const childPath = [...context.self.path, index];
    const childId = toNodeId(childPath);

    const childScope: StatementInfo = {
      id: childId,
      path: childPath,
      scope: context.scope,
      parent: context.self,
      node: statement,
    };

    const newContext = {
      ...result,
      self: childScope,
    };

    return analyzeStatement(statement, newContext);
  }, context);
}

function analyzeScopedStatement(
  context: AnalysisContext,
  statement: ScopedStatement
): AnalysisContext {
  const scope: ScopeInfo = {
    id: context.self.id,
    path: context.self.path,
    node: statement,
  };

  const newContext = analyzeStatements(
    {
      ...context,
      scope,
    },
    statement.statements
  );

  return {
    ...newContext,
    self: context.self,
    scope: context.scope,
    scopes: {
      ...newContext.scopes,
      [context.self.id]: scope,
    },
  };
}

function analyzeDeclaration(
  context: AnalysisContext,
  statement: UserVariableDeclaration
): AnalysisContext {
  const isRedclared = statement.name in context.frame;

  const info = {
    id: context.self.id,
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
  context: AnalysisContext,
  statement: AssignStatement
): AnalysisContext {
  return analyzeExpression(context, statement.expression);
}

function analyzeLogStatement(
  context: AnalysisContext,
  statement: LogStatement
): AnalysisContext {
  return analyzeExpression(context, statement.expression);
}

function analyseExpressionStatement(
  context: AnalysisContext,
  statement: ExpressionStatement
): AnalysisContext {
  return analyzeExpression(context, statement.expression);
}

function analyzeSleepStatement(
  context: AnalysisContext,
  _statement: SleepStatement
): AnalysisContext {
  return context;
}

const analyzeStatement = withIndex(
  (statement: Statement, context: AnalysisContext) => {
    switch (statement.type) {
      case "GroupStatement":
        return analyzeScopedStatement(context, statement);

      case "UserVariableDeclaration":
        return analyzeDeclaration(context, statement);

      case "AssignStatement":
        return analyzeAssignStatement(context, statement);

      case "LogStatement":
        return analyzeLogStatement(context, statement);

      case "ExpressionStatement":
        return analyseExpressionStatement(context, statement);

      case "SleepStatement":
        return analyzeSleepStatement(context, statement);

      default:
        return exhaustive(statement);
    }
  }
);

export { analyzeScopedStatement, analyzeStatements };
