interface AstNode {}

interface JsonEncodedBodyExpression extends AstNode {
  type: "JsonEncodedBodyExpression";
  content: Expression;
}

interface UrlEncodedBodyExpression extends AstNode {
  type: "UrlEncodedBodyExpression";
  fields: Record<string, StringLiteralExpression | IdentifierExpression>;
}

interface SafeHttpExpression extends AstNode {
  type: "SafeHttpExpression";
  method: "GET" | "HEAD" | "OPTIONS";
  url: Expression;
  headers?: Expression;
}

interface UnsafeHttpExpression extends AstNode {
  type: "UnsafeHttpExpression";
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  url: Expression;
  body: Expression;
  headers?: Expression;
}

type HttpExpression = SafeHttpExpression | UnsafeHttpExpression;

type HttpMethod = HttpExpression["method"];

interface NumberLiteralExpression extends AstNode {
  type: "NumberLiteralExpression";
  value: number;
}

interface BooleanLiteralExpression extends AstNode {
  type: "BooleanLiteralExpression";
  value: boolean;
}

interface StringLiteralExpression extends AstNode {
  type: "StringLiteralExpression";
  value: string;
}

interface RegexMatchExpression extends AstNode {
  type: "RegexMatchExpression";
  pattern: string;
  target: Expression;
}

interface IdentifierExpression extends AstNode {
  type: "IdentifierExpression";
  name: string;
}

interface NullExpression extends AstNode {
  type: "NullExpression";
}

interface ObjectLiteralExpression extends AstNode {
  type: "ObjectLiteralExpression";
  fields: Record<string, Expression>;
}

interface ArrayLiteralExpression extends AstNode {
  type: "ArrayLiteralExpression";
  elements: Expression[];
}

interface MemberExpression extends AstNode {
  type: "MemberExpression";
  object: Expression;
  property: Expression;
  computed: boolean;
  optional: boolean;
}

type Expression =
  | ArrayLiteralExpression
  | BooleanLiteralExpression
  | HttpExpression
  | IdentifierExpression
  | JsonEncodedBodyExpression
  | NullExpression
  | NumberLiteralExpression
  | ObjectLiteralExpression
  | RegexMatchExpression
  | StringLiteralExpression
  | UrlEncodedBodyExpression
  | MemberExpression;

interface GroupStatement extends AstNode {
  type: "GroupStatement";
  name: string;
  statements: Statement[];
}

interface UserVariableDeclaration extends AstNode {
  type: "UserVariableDeclaration";
  kind: "const" | "let";
  name: string;
  expression: Expression;
}

interface AssignStatement extends AstNode {
  type: "AssignStatement";
  name: string;
  expression: Expression;
}

type LogLevel = "log";

interface LogStatement extends AstNode {
  type: "LogStatement";
  level: LogLevel;
  expression: Expression;
}

interface SleepStatement extends AstNode {
  type: "SleepStatement";
  seconds: number;
}

interface ExpressionStatement extends AstNode {
  type: "ExpressionStatement";
  expression: Expression;
}

interface Fragment extends AstNode {
  type: "Fragment";
  statements: Statement[];
}

type Statement =
  | AssignStatement
  | ExpressionStatement
  | GroupStatement
  | LogStatement
  | SleepStatement
  | UserVariableDeclaration
  | Fragment;

interface ScenarioBase extends AstNode {
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

interface TestDefinition extends AstNode {
  type: "Test";
  defaultScenario?: DefaultScenarioDeclaration;
  scenarios: ScenarioDeclaration[];
}

function jsonEncodedBody(
  content: Expression | string,
): JsonEncodedBodyExpression {
  return {
    type: "JsonEncodedBodyExpression",
    content: typeof content === "string" ? string(content) : content,
  };
}

function urlEncodedBody(
  fields: UrlEncodedBodyExpression["fields"],
): UrlEncodedBodyExpression {
  return {
    type: "UrlEncodedBodyExpression",
    fields,
  };
}

function safeHttp(
  method: SafeHttpExpression["method"],
  url: Expression | string,
  headers?: Expression,
): SafeHttpExpression {
  return {
    type: "SafeHttpExpression",
    method,
    url: typeof url === "string" ? string(url) : url,
    headers,
  };
}

function unsafeHttp(
  method: UnsafeHttpExpression["method"],
  url: Expression | string,
  body: Expression,
  headers?: Expression,
): UnsafeHttpExpression {
  return {
    type: "UnsafeHttpExpression",
    method,
    url: typeof url === "string" ? string(url) : url,
    body,
    headers,
  };
}

function boolean(value: boolean): BooleanLiteralExpression {
  return {
    type: "BooleanLiteralExpression",
    value,
  };
}

function number(value: number): NumberLiteralExpression {
  return {
    type: "NumberLiteralExpression",
    value,
  };
}

function string(value: string): StringLiteralExpression {
  return {
    type: "StringLiteralExpression",
    value,
  };
}

function array(elements: Expression[]): ArrayLiteralExpression {
  return {
    type: "ArrayLiteralExpression",
    elements,
  };
}

function object(fields: Record<string, Expression>): ObjectLiteralExpression {
  return {
    type: "ObjectLiteralExpression",
    fields,
  };
}

function regex(pattern: string, target: Expression): RegexMatchExpression {
  return {
    type: "RegexMatchExpression",
    pattern,
    target,
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

function member(object: Expression, property: Expression): MemberExpression {
  return {
    type: "MemberExpression",
    object,
    property,
    computed: false,
    optional: false,
  };
}

function index(object: Expression, property: Expression): MemberExpression {
  return {
    ...member(object, property),
    computed: true,
  };
}

function optional(expression: MemberExpression): MemberExpression {
  return {
    ...expression,
    optional: true,
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
  expression: Expression,
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

function fragment(statements: Statement[]): Fragment {
  return {
    type: "Fragment",
    statements,
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
  statements: Statement[],
): DefaultScenarioDeclaration;
function defaultScenario(
  name: Statement[] | string | undefined,
  statements?: Statement[],
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
  defaultScenario?: DefaultScenarioDeclaration,
): TestDefinition;
function test(
  scenarios: ScenarioDeclaration[] | DefaultScenarioDeclaration,
  defaultScenario?: DefaultScenarioDeclaration,
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
  array,
  assign,
  boolean,
  declare,
  defaultScenario,
  expression,
  fragment,
  group,
  identifier,
  index,
  jsonEncodedBody,
  log,
  member,
  nil,
  number,
  object,
  optional,
  regex,
  safeHttp,
  scenario,
  sleep,
  string,
  test,
  unsafeHttp,
  urlEncodedBody,
  type ArrayLiteralExpression,
  type AssignStatement,
  type AstNode,
  type BooleanLiteralExpression,
  type DefaultScenarioDeclaration,
  type Expression,
  type ExpressionStatement,
  type Fragment,
  type GroupStatement,
  type HttpExpression,
  type HttpMethod,
  type IdentifierExpression,
  type JsonEncodedBodyExpression,
  type LogStatement,
  type MemberExpression,
  type NullExpression,
  type NumberLiteralExpression,
  type ObjectLiteralExpression,
  type RegexMatchExpression,
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
