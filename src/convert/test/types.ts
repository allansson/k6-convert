interface UrlEncodedBody {
  mimeType: "application/x-www-form-urlencoded";
  params: Record<string, string>;
}

type HttpRequestBody = UrlEncodedBody;

type SafeHttpMethod = "GET" | "HEAD" | "OPTIONS";
type UnsafeHttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

type HttpMethod = SafeHttpMethod | UnsafeHttpMethod;

interface HttpRequestStepBase {
  url: string;
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

interface SleepStep {
  type: "sleep";
  seconds: number;
}

interface LogStep {
  type: "log";
  message: string;
}

interface GroupStep {
  type: "group";
  name: string;
  steps: Step[];
}

type Step = SleepStep | LogStep | HttpRequestStep | GroupStep;

interface DefaultScenario {
  name?: string;
  steps: Step[];
}

interface Scenario {
  name: string;
  steps: Step[];
}

interface Test {
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
  LogStep,
  SafeHttpRequestStep,
  Scenario,
  SleepStep,
  Step,
  Test,
  UnsafeHttpRequestStep,
  UrlEncodedBody,
};
