import type {
  DefaultScenario,
  GroupStep,
  HttpRequestBody,
  HttpRequestStep,
  LogStep,
  SafeHttpRequestStep,
  Scenario,
  SleepStep,
  Step,
  Test,
  UnsafeHttpRequestStep,
  UrlEncodedBody,
} from "~/src/convert/test/types";

import {
  array,
  extend,
  lazy,
  literal,
  number,
  object,
  record,
  string,
  union,
  type Parser,
} from "~/src/validation";

const rawVariable = object({
  type: literal("raw"),
});

const variable = rawVariable;

const JsonEncodedBodySchema: Parser<HttpRequestBody> = object({
  mimeType: literal("application/json"),
  content: string(),
});

const UrlEncodedBodySchema: Parser<UrlEncodedBody> = object({
  mimeType: literal("application/x-www-form-urlencoded"),
  params: record(string()),
});

const HttpRequesBodySchema: Parser<HttpRequestBody> = union([
  UrlEncodedBodySchema,
  JsonEncodedBodySchema,
]);

const HttpRequestStepBaseSchema = object({
  url: string(),
  variables: record(variable),
});

const SafeHttpRequestSchema: Parser<SafeHttpRequestStep> = extend(
  HttpRequestStepBaseSchema,
  {
    type: literal("http-request"),
    method: union([literal("GET"), literal("HEAD"), literal("OPTIONS")]),
  },
);

const UnsafeHttpRequestSchema: Parser<UnsafeHttpRequestStep> = extend(
  HttpRequestStepBaseSchema,
  {
    type: literal("http-request"),
    method: union([
      literal("POST"),
      literal("PUT"),
      literal("DELETE"),
      literal("PATCH"),
    ]),
    body: HttpRequesBodySchema,
  },
);

const HttpRequestStepSchema: Parser<HttpRequestStep> = union([
  SafeHttpRequestSchema,
  UnsafeHttpRequestSchema,
]);

const SleepStepSchema: Parser<SleepStep> = object({
  type: literal("sleep"),
  seconds: number(),
});

const LogStepSchema: Parser<LogStep> = object({
  type: literal("log"),
  message: string(),
});

const GroupStepSchema: Parser<GroupStep> = object({
  type: literal("group"),
  name: string(),
  steps: lazy(() => array(StepSchema)),
});

const StepSchema: Parser<Step> = union([
  SleepStepSchema,
  LogStepSchema,
  HttpRequestStepSchema,
  GroupStepSchema,
]);

const DefaultScenarioSchema: Parser<DefaultScenario> = object({
  name: string().optional(),
  steps: array(StepSchema),
});

const ScenarioSchema: Parser<Scenario> = object({
  name: string(),
  steps: array(StepSchema),
});

const TestSchema: Parser<Test> = object({
  defaultScenario: DefaultScenarioSchema.optional(),
  scenarios: record(ScenarioSchema),
});

export { TestSchema };
