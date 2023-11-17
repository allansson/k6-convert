interface SearchParamsExpression {
  type: SearchParamsExpression;
  params: {
    [key: string]: Expression;
  };
}

interface HttpGetExpression {
  type: "HttpGetExpression";
  url: Expression;
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
  | SearchParamsExpression
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

type LogLevel = "log";

interface LogStatement {
  type: "LogStatement";
  level: LogLevel;
  expression: Expression;
}

interface SleepStatement {
  type: "SleepStatement";
  seconds: number;
}

interface ExpressionStatement {
  type: "ExpressionStatement";
  expression: Expression;
}

type Statement =
  | ExpressionStatement
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

function httpGet(url: Expression | string): HttpGetExpression {
  return {
    type: "HttpGetExpression",
    url: typeof url === "string" ? string(url) : url,
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

function log(level: LogLevel, expression: Expression): LogStatement {
  return {
    type: "LogStatement",
    level,
    expression,
  };
}

function expression(expression: Expression): ExpressionStatement {
  return {
    type: "ExpressionStatement",
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

function defaultScenario(statements: Statement[]): DefaultScenario;
function defaultScenario(
  name: string | undefined,
  statements: Statement[]
): DefaultScenario;
function defaultScenario(
  name: Statement[] | string | undefined,
  statements?: Statement[]
): DefaultScenario {
  if (Array.isArray(name)) {
    return {
      type: "DefaultScenario",
      name: undefined,
      statements: name,
    };
  }

  return {
    type: "DefaultScenario",
    name,
    statements: statements ?? [],
  };
}

function test(defaultScenario: DefaultScenario): Test;
function test(scenarios: Scenario[], defaultScenario?: DefaultScenario): Test;
function test(
  scenarios: Scenario[] | DefaultScenario,
  defaultScenario?: DefaultScenario
): Test {
  if (!Array.isArray(scenarios)) {
    return {
      type: "Test",
      defaultScenario: scenarios,
      scenarios: [],
    };
  }

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
  expression,
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
  type ExpressionStatement,
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
