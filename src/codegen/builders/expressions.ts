import type * as es from "estree";

function identifier(name: string): es.Identifier {
  return {
    type: "Identifier",
    name,
  };
}

function call(callee: es.Expression, args: es.Expression[]): es.CallExpression {
  return {
    type: "CallExpression",
    callee,
    arguments: args,
    optional: false,
  };
}

function literal(value: string | number | boolean | null): es.Literal {
  return {
    type: "Literal",
    value,
    raw: JSON.stringify(value),
  };
}

function arrow(
  params: es.Pattern[],
  body: es.Statement[] | es.Expression
): es.ArrowFunctionExpression {
  return {
    type: "ArrowFunctionExpression",
    params,
    body: Array.isArray(body) ? { type: "BlockStatement", body } : body,
    generator: false,
    async: false,
    expression: !Array.isArray(body),
  };
}

export { arrow, call, identifier, literal };
