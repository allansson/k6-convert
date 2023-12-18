import { join, ok, reduce } from "~/src/context";
import {
  array,
  boolean,
  declare,
  expression,
  fragment,
  group,
  identifier,
  jsonEncodedBody,
  log,
  member,
  nil,
  number,
  object,
  safeHttp,
  sleep,
  string,
  unsafeHttp,
  urlEncodedBody,
  type Expression,
  type HttpExpression,
  type IdentifierExpression,
  type Statement,
  type UserVariableDeclaration,
} from "~/src/convert/ast";
import type {
  ConverterContext,
  ConverterResult,
} from "~/src/convert/test/context";
import type {
  GroupStep,
  HttpRequestBody,
  HttpRequestStep,
  JsonEncodedBody,
  LogStep,
  RawVariable,
  SafeHttpRequestStep,
  SleepStep,
  Step,
  UnsafeHttpRequestStep,
  UrlEncodedBody,
  Variable,
} from "~/src/convert/test/types";

interface EncodedBody {
  expression: Expression;
  headers?: Expression;
}

type JsonPrimitive = string | number | boolean | null;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

function buildLiteral(value: JsonValue): Expression {
  switch (typeof value) {
    case "string":
      return string(value);

    case "number":
      return number(value);

    case "boolean":
      return boolean(value);

    case "object":
      if (value === null) {
        return nil();
      }

      if (Array.isArray(value)) {
        return array(value.map(buildLiteral));
      }

      return object(
        Object.fromEntries(
          Object.entries(value).map(
            ([key, value]) => [key, buildLiteral(value)] as const,
          ),
        ),
      );
  }
}

function tryParseJson(content: string): Expression | undefined {
  try {
    const value = JSON.parse(content) as JsonValue;

    return buildLiteral(value);
  } catch {
    return undefined;
  }
}

function fromJsonEncodedBody(
  _context: ConverterContext,
  body: JsonEncodedBody,
): ConverterResult<EncodedBody> {
  const headers = object({
    "Content-Type": string("application/json"),
  });

  const parsedBody = tryParseJson(body.content);

  if (parsedBody === undefined) {
    return ok({ expression: string(body.content), headers }).report({
      type: "InvalidJsonBody",
      content: body.content,
      node: body,
    });
  }

  return ok({
    expression: jsonEncodedBody(parsedBody),
    headers,
  });
}

function fromUrlEncodedBody(
  _context: ConverterContext,
  body: UrlEncodedBody,
): ConverterResult<EncodedBody> {
  const params = Object.entries(body.params).map(
    ([key, value]) => [key, string(value)] as const,
  );

  return ok({
    expression: urlEncodedBody(Object.fromEntries(params)),
  });
}

function fromHttpRequestBody(
  context: ConverterContext,
  body: HttpRequestBody,
): ConverterResult<EncodedBody> {
  switch (body.mimeType) {
    case "application/x-www-form-urlencoded":
      return fromUrlEncodedBody(context, body);

    case "application/json":
      return fromJsonEncodedBody(context, body);
  }
}

function fromRawVariable(
  _context: ConverterContext,
  name: string,
  target: IdentifierExpression,
  _variable: RawVariable,
): ConverterResult<UserVariableDeclaration> {
  return ok(declare("const", name, member(target, identifier("body"))));
}

function fromVariable(
  context: ConverterContext,
  name: string,
  target: IdentifierExpression,
  variable: Variable,
) {
  switch (variable.type) {
    case "raw":
      return fromRawVariable(context, name, target, variable);
  }
}

function fromHttpRequestStepWithVariables(
  context: ConverterContext,
  step: HttpRequestStep,
  request: HttpExpression,
): ConverterResult<Statement[]> {
  const variables = Object.entries(step.variables);

  if (variables.length === 0) {
    return ok([expression(request)]);
  }

  const response = identifier("response");

  const statements = join(
    variables.map(([name, variable]) => {
      return fromVariable(context, name, response, variable);
    }),
  );

  return statements.map((declarations) => [
    declare("const", "response", request),
    fragment(declarations),
  ]);
}

function fromSafeHttpRequestStep(
  context: ConverterContext,
  step: SafeHttpRequestStep,
): ConverterResult<Statement[]> {
  return fromHttpRequestStepWithVariables(
    context,
    step,
    safeHttp(step.method, string(step.url)),
  );
}

function fromUnsafeHttpRequestStep(
  context: ConverterContext,
  step: UnsafeHttpRequestStep,
): ConverterResult<Statement[]> {
  return fromHttpRequestBody(context, step.body).andThen(
    ({ expression: body, headers }) => {
      const bodyParam = headers !== undefined ? identifier("body") : body;

      const request = unsafeHttp(
        step.method,
        string(step.url),
        bodyParam,
        headers,
      );

      return fromHttpRequestStepWithVariables(context, step, request).map(
        (declarations) => {
          if (headers === undefined) {
            return declarations;
          }

          return [declare("const", "body", body), ...declarations];
        },
      );
    },
  );
}

function fromHttpRequestStep(context: ConverterContext, step: HttpRequestStep) {
  switch (step.method) {
    case "GET":
    case "HEAD":
    case "OPTIONS":
      return fromSafeHttpRequestStep(context, step);

    case "POST":
    case "PUT":
    case "DELETE":
    case "PATCH":
      return fromUnsafeHttpRequestStep(context, step);
  }
}

function fromGroupStep(
  context: ConverterContext,
  step: GroupStep,
): ConverterResult<Statement> {
  return fromSteps(context, step.steps).map((steps) => group(step.name, steps));
}

function fromSleepStep(
  _context: ConverterContext,
  step: SleepStep,
): ConverterResult<Statement> {
  return ok(sleep(step.seconds));
}

function fromLogStep(
  _context: ConverterContext,
  step: LogStep,
): ConverterResult<Statement> {
  return ok(log("log", string(step.message)));
}

function fromStep(
  context: ConverterContext,
  step: Step,
): ConverterResult<Statement[] | Statement> {
  switch (step.type) {
    case "group":
      return fromGroupStep(context, step);

    case "sleep":
      return fromSleepStep(context, step);

    case "log":
      return fromLogStep(context, step);

    case "http-request":
      return fromHttpRequestStep(context, step);
  }
}

function flatten<T>(array: T | T[]): T[] {
  return Array.isArray(array) ? array : [array];
}

function fromSteps(
  context: ConverterContext,
  steps: Step[],
): ConverterResult<Statement[]> {
  const results = steps.map((step) =>
    fromStep(context, step).map((value) => flatten(value)),
  );

  const statements: Statement[] = [];

  return reduce(statements, results, (statements, value) => {
    return [...statements, ...value];
  });
}

export { fromSteps };
