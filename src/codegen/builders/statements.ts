import type * as es from "estree";

function expressionStatement(
  expression: es.Expression
): es.ExpressionStatement {
  return {
    type: "ExpressionStatement",
    expression,
  };
}

function func(
  name: string | undefined,
  body: es.Statement[]
): es.FunctionDeclaration {
  return {
    type: "FunctionDeclaration",
    id: name !== undefined ? { type: "Identifier", name } : null,
    params: [],
    body: {
      type: "BlockStatement",
      body: body,
    },
    generator: false,
    async: false,
  };
}

function declare(
  kind: "const" | "let",
  name: string,
  expression: es.Expression
): es.VariableDeclaration {
  return {
    type: "VariableDeclaration",
    declarations: [
      {
        type: "VariableDeclarator",
        id: {
          type: "Identifier",
          name,
        },
        init: expression,
      },
    ],
    kind,
  };
}

function assign(
  name: string,
  expression: es.Expression
): es.AssignmentExpression {
  return {
    type: "AssignmentExpression",
    operator: "=",
    left: {
      type: "Identifier",
      name,
    },
    right: expression,
  };
}

export { assign, declare, expressionStatement, func };
