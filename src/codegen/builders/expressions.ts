import type * as es from "estree";
import { escapePropertyName } from "~/src/codegen/builders/utils";

function normalizeIdentifier(
  expression: es.Expression | string,
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

function regex(pattern: string): es.Literal {
  return {
    type: "Literal",
    value: new RegExp(pattern),
    regex: {
      pattern,
      flags: "",
    },
    raw: JSON.stringify(pattern),
  };
}

function object(
  properties: Array<[string, es.Expression]>,
): es.ObjectExpression {
  return {
    type: "ObjectExpression",
    properties: properties.map(([key, value]) => ({
      type: "Property",
      key: identifier(escapePropertyName(key)),
      value,
      kind: "init",
      computed: false,
      method: false,
      shorthand: false,
    })),
  };
}

function array(elements: es.Expression[]): es.ArrayExpression {
  return {
    type: "ArrayExpression",
    elements,
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

function index(
  object: es.Expression,
  index: es.Expression,
): es.MemberExpression {
  return {
    type: "MemberExpression",
    object,
    property: index,
    computed: true,
    optional: false,
  };
}

function optional(member: es.MemberExpression): es.MemberExpression {
  return { ...member, optional: true };
}

function arrow(
  params: es.Pattern[],
  body: es.Statement[] | es.Expression,
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

function nil(): es.Literal {
  return literal(null);
}

function logical(
  left: es.Expression,
  operator: es.LogicalOperator,
  right: es.Expression,
): es.LogicalExpression {
  return {
    type: "LogicalExpression",
    operator,
    left,
    right,
  };
}

export {
  array,
  arrow,
  call,
  identifier,
  index,
  literal,
  logical,
  member,
  nil,
  object,
  optional,
  regex,
};
