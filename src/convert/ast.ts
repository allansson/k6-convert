interface UrlEncodedBodyExpression {
  type: "UrlEncodedBodyExpression";
  fields: Record<string, StringLiteralExpression | IdentifierExpression>;
}

interface SafeHttpExpression {
  type: "SafeHttpExpression";
  method: "GET" | "HEAD" | "OPTIONS";
  url: Expression;
}

interface UnsafeHttpExpression {
  type: "UnsafeHttpExpression";
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  url: Expression;
  body: Expression;
}

type HttpExpression = SafeHttpExpression | UnsafeHttpExpression;

type HttpMethod = HttpExpression["method"];

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
  | HttpExpression
  | UrlEncodedBodyExpression
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

interface ScenarioBase {
  name?: string;
  statements: Statement[];
}

interface DefaultScenarioDeclaration extends ScenarioBase {
  type: "DefaultScenario";
}

interface ScenarioDeclaration extends ScenarioBase {
  type: "Scenario";
  name: string;
}

interface TestDefinition {
  type: "Test";
  defaultScenario?: DefaultScenarioDeclaration;
  scenarios: ScenarioDeclaration[];
}

function urlEncodedBody(
  fields: UrlEncodedBodyExpression["fields"]
): UrlEncodedBodyExpression {
  return {
    type: "UrlEncodedBodyExpression",
    fields,
  };
}

function safeHttp(
  method: SafeHttpExpression["method"],
  url: Expression | string
): SafeHttpExpression {
  return {
    type: "SafeHttpExpression",
    method,
    url: typeof url === "string" ? string(url) : url,
  };
}

function unsafeHttp(
  method: UnsafeHttpExpression["method"],
  url: Expression | string,
  body: Expression
): UnsafeHttpExpression {
  return {
    type: "UnsafeHttpExpression",
    method,
    url: typeof url === "string" ? string(url) : url,
    body,
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

function scenario(name: string, statements: Statement[]): ScenarioDeclaration {
  return {
    type: "Scenario",
    name,
    statements,
  };
}

function defaultScenario(statements: Statement[]): DefaultScenarioDeclaration;
function defaultScenario(
  name: string | undefined,
  statements: Statement[]
): DefaultScenarioDeclaration;
function defaultScenario(
  name: Statement[] | string | undefined,
  statements?: Statement[]
): DefaultScenarioDeclaration {
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

function test(defaultScenario: DefaultScenarioDeclaration): TestDefinition;
function test(
  scenarios: ScenarioDeclaration[],
  defaultScenario?: DefaultScenarioDeclaration
): TestDefinition;
function test(
  scenarios: ScenarioDeclaration[] | DefaultScenarioDeclaration,
  defaultScenario?: DefaultScenarioDeclaration
): TestDefinition {
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
  identifier,
  log,
  nil,
  safeHttp,
  scenario,
  sleep,
  string,
  test,
  unsafeHttp,
  urlEncodedBody,
  type AssignStatement,
  type AstNode,
  type DefaultScenarioDeclaration,
  type Expression as Expression,
  type ExpressionStatement,
  type GroupStatement,
  type HttpMethod,
  type IdentifierExpression,
  type LogStatement,
  type NullExpression,
  type SafeHttpExpression,
  type ScenarioDeclaration,
  type SleepStatement,
  type Statement,
  type StringLiteralExpression,
  type TestDefinition,
  type UnsafeHttpExpression,
  type UrlEncodedBodyExpression,
  type UserVariableDeclaration,
};
