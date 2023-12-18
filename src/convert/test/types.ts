interface Node {}

interface RawVariable extends Node {
  type: "raw";
}

type Variable = RawVariable;

interface JsonEncodedBody extends Node {
  mimeType: "application/json";
  content: string;
}

interface UrlEncodedBody extends Node {
  mimeType: "application/x-www-form-urlencoded";
  params: Record<string, string>;
}

type HttpRequestBody = UrlEncodedBody | JsonEncodedBody;

type SafeHttpMethod = "GET" | "HEAD" | "OPTIONS";
type UnsafeHttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

type HttpMethod = SafeHttpMethod | UnsafeHttpMethod;

interface HttpRequestStepBase extends Node {
  url: string;
  variables: Record<string, Variable>;
}

interface SafeHttpRequestStep extends HttpRequestStepBase {
  type: "http-request";
  method: SafeHttpMethod;
}

interface UnsafeHttpRequestStep extends HttpRequestStepBase {
  type: "http-request";
  method: UnsafeHttpMethod;
  body: HttpRequestBody;
}

type HttpRequestStep = SafeHttpRequestStep | UnsafeHttpRequestStep;

interface SleepStep extends Node {
  type: "sleep";
  seconds: number;
}

interface LogStep extends Node {
  type: "log";
  message: string;
}

interface GroupStep extends Node {
  type: "group";
  name: string;
  steps: Step[];
}

type Step = SleepStep | LogStep | HttpRequestStep | GroupStep;

interface DefaultScenario extends Node {
  name?: string;
  steps: Step[];
}

interface Scenario extends Node {
  name: string;
  steps: Step[];
}

interface Test extends Node {
  defaultScenario?: DefaultScenario;
  scenarios: {
    [name: string]: Scenario;
  };
}

export type {
  DefaultScenario,
  GroupStep,
  HttpMethod,
  HttpRequestBody,
  HttpRequestStep,
  JsonEncodedBody,
  LogStep,
  Node,
  RawVariable,
  SafeHttpRequestStep,
  Scenario,
  SleepStep,
  Step,
  Test,
  UnsafeHttpRequestStep,
  UrlEncodedBody,
  Variable,
};
