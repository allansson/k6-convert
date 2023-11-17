import type * as es from "estree";

function normalizeIdentifier(
  expression: es.Expression | string
): es.Expression {
  if (typeof expression === "string") {
    return identifier(expression);
  }

  return expression;
}

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

function member(
  object: es.Expression | string,
  property: es.Expression | string,
  ...rest: Array<es.Expression | string>
): es.MemberExpression {
  const expression: es.MemberExpression = {
    type: "MemberExpression",
    object: normalizeIdentifier(object),
    property: normalizeIdentifier(property),
    computed: false,
    optional: false,
  };

  return rest.reduce<es.MemberExpression>((object, property) => {
    return {
      type: "MemberExpression",
      object,
      property: normalizeIdentifier(property),
      computed: false,
      optional: false,
    };
  }, expression);
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

export { arrow, call, identifier, literal, member };
