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

type SafeHttpMethod = "GET" | "HEAD" | "OPTIONS";
type UnsafeHttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

type HttpMethod = SafeHttpMethod | UnsafeHttpMethod;

interface HttpRequestStepBase {
  url: string;
}

const HttpRequestStepBaseSchema: Parser<HttpRequestStepBase> = object({
  url: string(),
});

interface SafeHttpRequestStep extends HttpRequestStepBase {
  type: "http-request";
  method: SafeHttpMethod;
}

const SafeHttpRequestSchema: Parser<SafeHttpRequestStep> = extend(
  HttpRequestStepBaseSchema,
  {
    type: literal("http-request"),
    method: union([literal("GET"), literal("HEAD"), literal("OPTIONS")]),
  }
);

interface UnsafeHttpRequestStep extends HttpRequestStepBase {
  type: "http-request";
  method: UnsafeHttpMethod;
  body?: string;
}

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
    body: string().optional(),
  }
);

type HttpRequestStep = SafeHttpRequestStep | UnsafeHttpRequestStep;

const HttpRequestStepSchema: Parser<HttpRequestStep> = union([
  SafeHttpRequestSchema,
  UnsafeHttpRequestSchema,
]);

interface SleepStep {
  type: "sleep";
  seconds: number;
}

const SleepStepSchema: Parser<SleepStep> = object({
  type: literal("sleep"),
  seconds: number(),
});

interface LogStep {
  type: "log";
  message: string;
}

const LogStepSchema: Parser<LogStep> = object({
  type: literal("log"),
  message: string(),
});

interface GroupStep {
  type: "group";
  name: string;
  steps: Step[];
}

const GroupStepSchema: Parser<GroupStep> = object({
  type: literal("group"),
  name: string(),
  steps: lazy(() => array(StepSchema)),
});

type Step = SleepStep | LogStep | HttpRequestStep | GroupStep;

const StepSchema: Parser<Step> = union([
  SleepStepSchema,
  LogStepSchema,
  HttpRequestStepSchema,
  GroupStepSchema,
]);

interface DefaultScenario {
  name?: string;
  steps: Step[];
}

const DefaultScenarioSchema: Parser<DefaultScenario> = object({
  name: string().optional(),
  steps: array(StepSchema),
});

interface Scenario {
  name: string;
  steps: Step[];
}

const ScenarioSchema: Parser<Scenario> = object({
  name: string(),
  steps: array(StepSchema),
});

interface Test {
  defaultScenario?: DefaultScenario;
  scenarios: Record<string, Scenario>;
}

const TestSchema: Parser<Test> = object({
  defaultScenario: DefaultScenarioSchema.optional(),
  scenarios: record(ScenarioSchema),
});

export {
  TestSchema,
  type DefaultScenario,
  type GroupStep,
  type HttpMethod,
  type HttpRequestStep,
  type LogStep,
  type SafeHttpRequestStep,
  type Scenario,
  type SleepStep,
  type Step,
  type Test,
  type UnsafeHttpRequestStep,
};
