interface Variables {
  [key: string]: string;
}

interface HttpGetExpression {
  type: "HttpGetExpression";
  url: string;
  variables: Variables;
}

interface StringLiteralExpression {
  type: "StringLiteralExpression";
  value: string;
}

interface IdentifierExpression {
  type: "IdentifierExpression";
  name: string;
}

interface NullExpression {
  type: "NullExpression";
}

type Expression =
  | HttpGetExpression
  | IdentifierExpression
  | NullExpression
  | StringLiteralExpression;

interface GroupStatement {
  type: "GroupStatement";
  name: string;
  statements: Statement[];
}

interface UserVariableDeclaration {
  type: "UserVariableDeclaration";
  kind: "const" | "let";
  name: string;
  expression: Expression;
}

interface AssignStatement {
  type: "AssignStatement";
  name: string;
  expression: Expression;
}

interface LogStatement {
  type: "LogStatement";
  expression: Expression;
}

interface SleepStatement {
  type: "SleepStatement";
  seconds: number;
}

type Statement =
  | GroupStatement
  | UserVariableDeclaration
  | AssignStatement
  | LogStatement
  | SleepStatement;

type AstNode = Statement | Expression;

interface DefaultScenario {
  type: "DefaultScenario";
  name?: string;
  statements: Statement[];
}

interface Scenario {
  type: "Scenario";
  name: string;
  statements: Statement[];
}

interface Test {
  type: "Test";
  defaultScenario?: DefaultScenario;
  scenarios: Scenario[];
}

function httpGet(url: string, variables?: Variables): HttpGetExpression {
  return {
    type: "HttpGetExpression",
    url,
    variables: variables ?? {},
  };
}

function string(value: string): StringLiteralExpression {
  return {
    type: "StringLiteralExpression",
    value,
  };
}

function identifier(name: string): IdentifierExpression {
  return {
    type: "IdentifierExpression",
    name,
  };
}

function nil(): NullExpression {
  return {
    type: "NullExpression",
  };
}

function group(name: string, statements: Statement[]): GroupStatement {
  return {
    type: "GroupStatement",
    name,
    statements,
  };
}

function declare(
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

function assign(name: string, expression: Expression): AssignStatement {
  return {
    type: "AssignStatement",
    name,
    expression,
  };
}

function sleep(seconds: number): SleepStatement {
  return {
    type: "SleepStatement",
    seconds,
  };
}

function log(expression: Expression): LogStatement {
  return {
    type: "LogStatement",
    expression,
  };
}

function scenario(name: string, statements: Statement[]): Scenario {
  return {
    type: "Scenario",
    name,
    statements,
  };
}

function defaultScenario(
  name: string | undefined,
  statements: Statement[]
): DefaultScenario {
  return {
    type: "DefaultScenario",
    name,
    statements,
  };
}

function test(scenarios: Scenario[], defaultScenario?: DefaultScenario): Test {
  return {
    type: "Test",
    defaultScenario,
    scenarios,
  };
}

export {
  assign,
  declare,
  defaultScenario,
  group,
  httpGet,
  identifier,
  log,
  nil,
  scenario,
  sleep,
  string,
  test,
  type AssignStatement,
  type AstNode,
  type DefaultScenario,
  type Expression,
  type GroupStatement,
  type HttpGetExpression,
  type IdentifierExpression,
  type LogStatement,
  type NullExpression,
  type Scenario,
  type SleepStatement,
  type Statement,
  type StringLiteralExpression,
  type Test,
  type UserVariableDeclaration,
};
