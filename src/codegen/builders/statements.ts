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

export { expressionStatement, func };
