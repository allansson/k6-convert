import {
  expression,
  group,
  log,
  safeHttp,
  sleep,
  string,
  unsafeHttp,
  type Statement,
} from "~/src/convert/ast";
import type {
  GroupStep,
  HttpRequestStep,
  LogStep,
  SafeHttpRequestStep,
  SleepStep,
  Step,
  UnsafeHttpRequestStep,
} from "~/src/convert/test/types";

function fromSafeHttpRequestStep(step: SafeHttpRequestStep) {
  return expression(safeHttp(step.method, string(step.url)));
}

function fromUnsafeHttpRequestStep(step: UnsafeHttpRequestStep) {
  return expression(
    unsafeHttp(step.method, string(step.url), string(step.body ?? ""))
  );
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
  return group(step.name, step.steps.map(fromStep));
}

function fromSleepStep(step: SleepStep) {
  return sleep(step.seconds);
}

function fromLogStep(step: LogStep) {
  return log("log", string(step.message));
}

function fromStep(step: Step): Statement {
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
