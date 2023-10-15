export interface Variables {
  [key: string]: string;
}

export interface HttpGetExpression {
  type: "HttpGetExpression";
  url: string;
  variables: Variables;
}

export interface StringLiteralExpression {
  type: "StringLiteralExpression";
  value: string;
}

export interface IdentifierExpression {
  type: "IdentifierExpression";
  name: string;
}

export interface NullExpression {
  type: "NullExpression";
}

export type Expression =
  | HttpGetExpression
  | IdentifierExpression
  | NullExpression
  | StringLiteralExpression;

export interface GroupStatement {
  type: "GroupStatement";
  name: string;
  statements: Statement[];
}

export interface UserVariableDeclaration {
  type: "UserVariableDeclaration";
  kind: "const" | "let";
  name: string;
  expression: Expression;
}

export interface AssignStatement {
  type: "AssignStatement";
  name: string;
  expression: Expression;
}

export interface LogStatement {
  type: "LogStatement";
  expression: Expression;
}

export interface SleepStatement {
  type: "SleepStatement";
  seconds: number;
}

export type Statement =
  | GroupStatement
  | UserVariableDeclaration
  | AssignStatement
  | LogStatement
  | SleepStatement;

export type AstNode = Statement | Expression;

export function httpGet(url: string, variables?: Variables): HttpGetExpression {
  return {
    type: "HttpGetExpression",
    url,
    variables: variables ?? {},
  };
}

export function string(value: string): StringLiteralExpression {
  return {
    type: "StringLiteralExpression",
    value,
  };
}

export function identifier(name: string): IdentifierExpression {
  return {
    type: "IdentifierExpression",
    name,
  };
}

export function nil(): NullExpression {
  return {
    type: "NullExpression",
  };
}

export function group(name: string, statements: Statement[]): GroupStatement {
  return {
    type: "GroupStatement",
    name,
    statements,
  };
}

export function declare(
  kind: "const" | "let",
  name: string,
  expression: Expression
): UserVariableDeclaration {
  return {
    type: "UserVariableDeclaration",
    kind,
    name,
    expression,
  };
}

export function assign(name: string, expression: Expression): AssignStatement {
  return {
    type: "AssignStatement",
    name,
    expression,
  };
}

export function sleep(seconds: number): SleepStatement {
  return {
    type: "SleepStatement",
    seconds,
  };
}

export function log(expression: Expression): LogStatement {
  return {
    type: "LogStatement",
    expression,
  };
}
