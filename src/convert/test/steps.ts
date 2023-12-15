import {
  array,
  boolean,
  declare,
  expression,
  group,
  identifier,
  jsonEncodedBody,
  log,
  nil,
  number,
  object,
  safeHttp,
  sleep,
  string,
  unsafeHttp,
  urlEncodedBody,
  type Expression,
  type Statement,
} from "~/src/convert/ast";
import type {
  GroupStep,
  HttpRequestBody,
  HttpRequestStep,
  JsonEncodedBody,
  LogStep,
  SafeHttpRequestStep,
  SleepStep,
  Step,
  UnsafeHttpRequestStep,
  UrlEncodedBody,
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

function fromJsonEncodedBody(body: JsonEncodedBody): EncodedBody {
  const headers = object({
    "Content-Type": string("application/json"),
  });

  const parsedBody = tryParseJson(body.content);

  if (parsedBody === undefined) {
    return {
      expression: string(body.content),
      headers,
    };
  }

  return {
    expression: jsonEncodedBody(parsedBody),
    headers,
  };
}

function fromUrlEncodedBody(body: UrlEncodedBody): EncodedBody {
  const params = Object.entries(body.params).map(
    ([key, value]) => [key, string(value)] as const,
  );

  return { expression: urlEncodedBody(Object.fromEntries(params)) };
}

function fromHttpRequestBody(body: HttpRequestBody): EncodedBody {
  switch (body.mimeType) {
    case "application/x-www-form-urlencoded":
      return fromUrlEncodedBody(body);

    case "application/json":
      return fromJsonEncodedBody(body);
  }
}

function fromSafeHttpRequestStep(step: SafeHttpRequestStep) {
  return expression(safeHttp(step.method, string(step.url)));
}

function fromUnsafeHttpRequestStep(step: UnsafeHttpRequestStep) {
  const body = fromHttpRequestBody(step.body);

  if (body.headers !== undefined) {
    return [
      declare("const", "body", body.expression),
      expression(
        unsafeHttp(
          step.method,
          string(step.url),
          identifier("body"),
          body.headers,
        ),
      ),
    ];
  }

  return expression(unsafeHttp(step.method, string(step.url), body.expression));
}

function fromHttpRequestStep(step: HttpRequestStep) {
  switch (step.method) {
    case "GET":
    case "HEAD":
    case "OPTIONS":
      return fromSafeHttpRequestStep(step);

    case "POST":
    case "PUT":
    case "DELETE":
    case "PATCH":
      return fromUnsafeHttpRequestStep(step);
  }
}

function fromGroupStep(step: GroupStep) {
  return group(step.name, step.steps.flatMap(fromStep));
}

function fromSleepStep(step: SleepStep) {
  return sleep(step.seconds);
}

function fromLogStep(step: LogStep) {
  return log("log", string(step.message));
}

function fromStep(step: Step): Statement[] | Statement {
  switch (step.type) {
    case "group":
      return fromGroupStep(step);

    case "sleep":
      return fromSleepStep(step);

    case "log":
      return fromLogStep(step);

    case "http-request":
      return fromHttpRequestStep(step);
  }
}

export { fromStep };
